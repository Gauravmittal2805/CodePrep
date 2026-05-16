import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import Company from "../models/Company";
import Problem from "../models/Problem";
import Submission from "../models/Submission";
import InterviewSession from "../models/InterviewSession";
import axios from "axios";

const router = Router();

router.post("/generate-plan", requireAuth, async (req: any, res: Response) => {
    try {
        const { companyId } = req.body;
        const uid = req.user?.uid;

        if (!companyId) {
            return res.status(400).json({ success: false, error: "Company ID is required" });
        }

        // 1. Fetch Company Data
        const company = await Company.findOne({ companyId });
        if (!company) {
            return res.status(404).json({ success: false, error: "Company not found" });
        }

        // 2. Fetch User Stats (Solved unique problems)
        const acceptedSubmissions = await Submission.find({
            uid,
            verdict: { $in: ['AC', 'Accepted'] }
        }).distinct('problemIdentifier');

        // 3. Fetch Company Problems
        const companyProblems = await Problem.find({
            companies: { $in: [new RegExp(`^${company.name}$`, 'i')] },
            status: 'Published'
        }).select('title id slug difficulty tags topics').lean();

        // 4. Analyze Coverage
        const solvedCompanyProblems = companyProblems.filter(p =>
            acceptedSubmissions.includes(p.slug) || acceptedSubmissions.includes(p.id)
        );

        const unsolvedCompanyProblems = companyProblems.filter(p =>
            !acceptedSubmissions.includes(p.slug) && !acceptedSubmissions.includes(p.id)
        );

        // 5. Construct Prompt
        const prompt = `
Generate a highly personalized coding practice plan for a user preparing for ${company.name}.
Context:
- Company Pattern: ${JSON.stringify(company.pattern)}
- Focus Areas: ${company.focusAreas.join(", ")}
- User Performance for ${company.name}: ${solvedCompanyProblems.length} solved out of ${companyProblems.length} available on our platform.
- Problems user hasn't solved yet (data-driven candidates): ${unsolvedCompanyProblems.length > 0 ? JSON.stringify(unsolvedCompanyProblems.slice(0, 30)) : "No specific problems found in our database for this company yet. Please suggest general topics aligned with their profile."}

Requirements:
- Plan Duration: One Week (7 Days).
- Introduction: Keep it concise, professional, and elite. Avoid using tables in the introduction. Mention the user's current status briefly.
- Daily Structure: Mention exactly 2-3 specific problems from the unsolved list provided above for each day. Use exactly "### Day X:" as the heading for each day.
- Focus: Align with ${company.name}'s specific patterns (e.g. if graph is 40%, give more graphs).
- Difficulty: Start with their current level and gradually increase.
- Tone: Recruiter-grade, elite, and highly motivating.
- Visuals: Use professional Markdown formatting, tables, or bold sections.
- Disclaimer: Mention this is an AI-generated personalized roadmap.

Output should be the Markdown content only. No conversational filler.
`;

        // 6. Call Groq
        console.log(`[AI] Generating plan for ${company.name} (User: ${uid})`);
        console.log(`[AI] Problems found: ${companyProblems.length}, Solved: ${solvedCompanyProblems.length}`);

        const groqResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are an elite Technical Coaching AI for CodePrep. You provide data-driven, recruiter-grade practice plans." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.6,
                max_tokens: 2048
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );

        const plan = (groqResponse.data as any).choices[0].message.content;

        res.json({
            success: true,
            data: { plan }
        });

    } catch (error: any) {
        console.error("AI Generation Error Details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        res.status(500).json({
            success: false,
            error: error.response?.data?.error?.message || "Failed to generate plan. AI might be busy.",
            details: error.message
        });
    }
});

router.post("/generate-questions", requireAuth, async (req: any, res: Response) => {
    try {
        const { type, difficulty, focusArea, questionCount, aiFocusTags, resumeText } = req.body;

        const prompt = `Generate exactly ${questionCount || 3} questions for a ${type} interview.
        Difficulty: ${difficulty || 'Medium'}
        Focus Area: ${focusArea || 'General'}
        ${aiFocusTags && aiFocusTags.length > 0 ? `AI Focus Tags (Prioritize these topics): ${aiFocusTags.join(", ")}` : ""}
        ${resumeText ? `Candidate Resume Context (Extract relevant technologies/experience): ${resumeText.substring(0, 2000)}` : ""}

        Guidelines:
        1. If the type is "HR" or "Behavioral", DO NOT ask coding or algorithmic questions. Focus on leadership, conflict resolution, strengths/weaknesses, and STAR method situations.
        2. If the type is "Technical", focus on Data Structures, Algorithms, or the specific "Focus Area". CRITICAL: Focus ONLY on intuition, approach, theory, and complexity analysis. DO NOT ask for code or pseudo-code. All questions must be answerable COMPLETELY via speech.
        3. If the type is "System Design", focus on scalability, architecture, load balancing, and high-level design.
        4. Questions should be concise and professional.
        5. Use the Resume Context and AI Focus Tags to make questions highly relevant to the candidate's profile.
        
        Return a JSON object with a single key "questions" containing an array of strings. 
        Example: { "questions": ["Question 1", "Question 2"] }`;

        const groqResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `You are a Senior Interviewer at a top tech company. Your task is to generate relevant ${type} interview questions. Return ONLY a valid JSON object.`
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );

        let content = (groqResponse.data as any).choices[0].message.content;
        // In case it's wrapped in an object like { "questions": [...] }
        let questions = JSON.parse(content);
        if (!Array.isArray(questions) && questions.questions) {
            questions = questions.questions;
        }

        res.json({
            success: true,
            data: { questions }
        });

    } catch (error: any) {
        console.error("Generate Questions Error:", error.message);
        res.status(500).json({ success: false, error: "Failed to generate questions" });
    }
});

router.post("/chat", requireAuth, async (req: any, res: Response) => {
    try {
        const { messages, type } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ success: false, error: "Messages array is required" });
        }

        // Map messages to Groq/OpenAI format (role and content)
        const formattedMessages = messages.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : msg.role === 'system' ? 'system' : 'assistant',
            content: msg.text || msg.content || ""
        }));

        const isTechnical = type === 'Technical' || type === 'Coding' || !type;

        console.log(`[AI Chat] Processing ${type || 'General'} request with ${formattedMessages.length} messages`);

        const groqResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `You are Ava, a Senior Technical Interviewer at CodePrep. Your goal is to conduct a professional ${type || 'technical'} interview. 
                        ${isTechnical ? "CRITICAL: All questions must be answerable COMPLETELY via speech. DO NOT ask for code, pseudo-code, or implementation details. Focus ONLY on conceptual intuition, high-level logic, and theory." : ""}
                        For every response the user gives: 1. Briefly acknowledge their answer. 2. Immediately ask the NEXT specific question to move the interview forward. Keep your total response under 3 sentences. Be firm, professional, and maintain the flow of the session.`
                    },
                    ...formattedMessages
                ],
                temperature: 0.7,
                max_tokens: 500
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );

        const aiResponse = (groqResponse.data as any).choices[0].message.content;
        console.log("[AI Chat] Received response from Groq");

        res.json({
            success: true,
            data: { response: aiResponse }
        });

    } catch (error: any) {
        console.error("AI Chat Error Details:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        res.status(500).json({
            success: false,
            error: "Failed to get AI response. Please try again."
        });
    }
});

router.post("/submit-session", requireAuth, async (req: any, res: Response) => {
    try {
        const {
            transcript,
            questionWiseAnswers,
            metrics,
            type,
            difficulty,
            companyTag,
            aiFocusTags,
            resumeContent
        } = req.body;
        const uid = req.user?.uid;

        if (!transcript || !uid) {
            return res.status(400).json({ success: false, error: "Missing required data" });
        }

        // Calculate fillers and pauses if not already provided
        const fillers = ["um", "uh", "like", "actually", "basically", "so"];
        let fillerCount = 0;
        let wordCount = 0;
        transcript.forEach((msg: any) => {
            if (msg.role === 'user') {
                const words = msg.text.toLowerCase().split(/\s+/);
                fillerCount += words.filter((w: string) => fillers.includes(w)).length;
                wordCount += words.length;
            }
        });

        const totalDurationMinutes = (metrics?.totalDuration || 1) / 60;
        const wpm = Math.round(wordCount / totalDurationMinutes);

        const prompt = `
        You are a Senior Technical Interviewer and Performance Counselor.
        Evaluate the following technical interview session for a ${type} round.

        Target Company: ${companyTag}
        Difficulty: ${difficulty}
        AI Focus Tags: ${aiFocusTags ? aiFocusTags.join(", ") : "General"}
        ${resumeContent ? `Candidate Resume Context: ${resumeContent.substring(0, 1500)}` : ""}

        Transcript Data:
        ${JSON.stringify(transcript)}

        Metrics Provided:
        - Filler Word Count: ${fillerCount}
        - Questions Answered: ${questionWiseAnswers?.length || 0}

        Requirements:
        1. Evaluate technical depth, problem-solving clarity, and communication skills based on the context (Company, Resume, Focus Areas).
        2. Provide specific strengths and weaknesses.
        3. Create a short-term improvement plan.
        4. Give an overall hiring recommendation.
        5. Return EXACTLY in this JSON format:
        {
          "overallScore": number (0-100),
          "technicalScore": number,
          "communicationScore": number,
          "confidenceScore": number,
          "strengths": ["string"],
          "weaknesses": ["string"],
          "detailedFeedback": ["string"],
          "improvementPlan": ["string"],
          "hireRecommendation": "Strong Hire / Hire / Weak Hire / Reject",
          "questionFeedback": [
             { "question": "string", "score": number, "feedback": "string", "suggestion": "string" }
          ]
        }
        `;

        const groqResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are an AI Interview Evaluator. You provide critical, data-driven, and objective scores in JSON format. Use the provided context (Company, Resume, Focus Areas) to evaluate if the candidate is a good fit for the specific roles." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.5,
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 45000
            }
        );

        const aiReport = JSON.parse((groqResponse.data as any).choices[0].message.content);

        // Save to Database
        const session = new InterviewSession({
            uid,
            interviewType: type,
            difficulty,
            companyTag: companyTag || 'General',
            aiFocusTags: aiFocusTags || [],
            resumeContent: resumeContent || "",
            transcript,
            questionWiseAnswers: aiReport.questionFeedback?.map((q: any, i: number) => ({
                question: q.question,
                answer: transcript.find((m: any, idx: number) => m.role === 'user' && idx > 0 && transcript[idx - 1].text === q.question)?.text || "",
                score: q.score,
                feedback: q.feedback,
                suggestion: q.suggestion,
                duration: questionWiseAnswers?.[i]?.duration || 0
            })),
            metrics: {
                ...metrics,
                fillerWordCount: fillerCount,
                wpm: wpm
            },
            aiReport: {
                overallScore: aiReport.overallScore,
                technicalScore: aiReport.technicalScore,
                communicationScore: aiReport.communicationScore,
                confidenceScore: aiReport.confidenceScore,
                strengths: aiReport.strengths,
                weaknesses: aiReport.weaknesses,
                detailedFeedback: aiReport.detailedFeedback,
                improvementPlan: aiReport.improvementPlan,
                hireRecommendation: aiReport.hireRecommendation,
                questionFeedback: aiReport.questionFeedback
            },
            status: 'completed'
        });

        await session.save();

        res.json({
            success: true,
            data: {
                report: aiReport,
                sessionId: session._id,
                computedMetrics: { fillerCount, wpm }
            }
        });

    } catch (error: any) {
        console.error("AI Evaluation Error:", error);
        res.status(500).json({ success: false, error: "Failed to generate interview report" });
    }
});

router.get("/history", requireAuth, async (req: any, res: Response) => {
    try {
        const uid = req.user?.uid;
        const sessions = await InterviewSession.find({ uid })
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: sessions
        });
    } catch (error: any) {
        console.error("Fetch History Error:", error.message);
        res.status(500).json({ success: false, error: "Failed to fetch interview history" });
    }
});

router.get("/report/:id", requireAuth, async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const uid = req.user?.uid;

        const session = await InterviewSession.findById(id);
        if (!session) {
            return res.status(404).json({ success: false, error: "Session not found" });
        }

        // Ensure user can only see their own reports (unless admin)
        if (session.uid !== uid) {
            return res.status(403).json({ success: false, error: "Unauthorized access" });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (error: any) {
        console.error("Fetch Report Error:", error.message);
        res.status(500).json({ success: false, error: "Failed to fetch report" });
    }
});

export default router;

