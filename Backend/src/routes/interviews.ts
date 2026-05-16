
import express from 'express';
import Groq from 'groq-sdk';
import Interview from '../models/Interview';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// POST /api/interviews/generate-questions
router.post('/generate-questions', async (req, res) => {
    try {
        const { topic, difficulty, count = 5, type } = req.body;

        const prompt = `Generate ${count} unique interview questions for a "${type}" interview round. 
        Focus on topic: "${topic}".
        Difficulty: "${difficulty}".
        Strictly return a valid JSON array of objects. 
        Each object must have keys: 
        - "text" (string): The question itself.
        - "type" (string): Technical/Behavioral/HR/System Design.
        - "difficulty" (string): Easy/Medium/Hard.
        - "answer" (string): A concise expected answer or key points to look for (max 2-3 sentences).
        
        Do not include any markdown, code blocks, or extra text. Just the JSON array.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });

        const content = completion.choices[0]?.message?.content || "";
        let questions = [];

        if (content) {
            // Extract JSON array
            const jsonMatch = content.match(/\[.*\]/s);
            if (jsonMatch) {
                questions = JSON.parse(jsonMatch[0]);
            }
        }

        res.json({ success: true, questions });
    } catch (error) {
        console.error("Error generating questions:", error);
        res.status(500).json({ success: false, message: "AI Generation Failed" });
    }
});

// POST /api/interviews/create
router.post('/create', async (req, res) => {
    try {
        const { title, companyTag, type, scheduleType, duration, config, pdfFile, questions } = req.body;

        // Default questions array
        let generatedQuestions = questions || [];

        // 1. AI Generation Logic (Only if questions not provided)
        if (!questions || questions.length === 0) {
            if (config && config.questionSource === 'auto') {
                try {
                    const prompt = `Generate 5 unique interview questions for a "${type}" interview round. 
                    Focus on "${companyTag}" style if applicable.
                    Difficulty: "${config.difficulty}".
                    Strictly return a valid JSON array of objects. 
                    Each object must have keys: "text" (string), "type" (string e.g. Technical/Behavioral/HR), "difficulty" (string e.g. Easy/Medium/Hard).
                    Do not include any markdown, code blocks, or extra text. Just the JSON array.`;

                    const completion = await groq.chat.completions.create({
                        messages: [{ role: "user", content: prompt }],
                        model: "llama-3.3-70b-versatile",
                    });

                    const content = completion.choices[0]?.message?.content || "";
                    if (content) {
                        // Extract JSON array
                        const jsonMatch = content.match(/\[.*\]/s);
                        if (jsonMatch) {
                            generatedQuestions = JSON.parse(jsonMatch[0]);
                        }
                    }
                } catch (aiError) {
                    console.error("AI Generation Failed:", aiError);
                    // Fallback questions if AI fails
                    generatedQuestions = [
                        { text: `Describe a challenging situation you faced in a ${type} role.`, type: "Behavioral", difficulty: "Medium" },
                        { text: `What are your strengths relevant to ${type}?`, type: "HR", difficulty: "Easy" }
                    ];
                }
            }

            // 2. Manual Logic
            if (config && config.questionSource === 'manual') {
                // Logic for manual upload handling (metadata only for now)
                generatedQuestions = [
                    { text: "Please refer to the uploaded Question Bank PDF for questions.", type: "Manual", difficulty: "Varied" }
                ];
                // If pdfFile is provided in body (e.g. filename), it's saved in the document
            }
        }

        const newInterview = new Interview({
            title,
            companyTag,
            type,
            scheduleType,
            duration,
            config,
            questions: generatedQuestions,
            pdfFile,
            status: 'scheduled',
            createdAt: new Date()
        });

        await newInterview.save();
        res.status(201).json({ success: true, interview: newInterview });

    } catch (error) {
        console.error("Error creating interview:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

export default router;
