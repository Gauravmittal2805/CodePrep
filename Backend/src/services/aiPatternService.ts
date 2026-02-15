import Groq from 'groq-sdk';

interface OAPattern {
    questionDistribution: {
        totalQuestions: string;
        difficulty: string;
        timeAllocation: string;
    };
    topicFocus: Array<{
        topic: string;
        percentage: string;
        description: string;
    }>;
    commonPatterns: string[];
    assessmentStructure: {
        duration: string;
        navigation: string;
        partialCredit: string;
        environment: string;
    };
    recentTrends: string[];
    successTips: string[];
}

export class AIPatternService {
    private client: Groq;

    constructor() {
        // Fallback to process.env if available, otherwise check specific env var
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error('GROQ_API_KEY missing in environment variables');
            // We'll throw an error when trying to use the client if key is missing,
            // but for constructor we can be lenient or strict depending on preference.
            // For now, let's create the client, it will fail on request if key is invalid/missing.
        }
        this.client = new Groq({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });
    }

    async generateOAPattern(companyName: string): Promise<OAPattern> {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not configured in backend .env file');
        }

        const prompt = `You are an expert technical interviewer with deep knowledge of company hiring practices. Generate the LATEST and MOST ACCURATE Online Assessment (OA) pattern for ${companyName}.

Please provide detailed, current information about their technical assessment process in valid JSON format. Do not include any markdown formatting like \`\`\`json or extra text. JUST THE RAW JSON object.

Structure:
{
    "questionDistribution": {
        "totalQuestions": "number and type of questions (e.g., '2-3 coding problems')",
        "difficulty": "breakdown by difficulty (e.g., '1 Easy, 1-2 Medium')",
        "timeAllocation": "time per question or total (e.g., '30-45 minutes per question')"
    },
    "topicFocus": [
        {
            "topic": "primary topic name (e.g., 'Arrays & Strings')",
            "percentage": "approximate frequency (e.g., '40%')",
            "description": "what types of problems to expect"
        }
    ],
    "commonPatterns": [
        "specific problem patterns they commonly use (e.g., 'Two-pointer', 'Sliding window')"
    ],
    "assessmentStructure": {
        "duration": "total assessment time",
        "navigation": "can you jump between questions (flexible) or sequential (strict)",
        "partialCredit": "do they give partial credit for test cases",
        "environment": "coding platform details if known (HackerRank, CodeSignal, etc.)"
    },
    "recentTrends": [
        "any recent changes or trends in their OA process (2024-2026 data)"
    ],
    "successTips": [
        "specific actionable tips for succeeding in their OA"
    ]
}

Focus on CURRENT and ACCURATE information for ${companyName}. If specific details aren't publicly definitive, use "Varies" or best estimates based on recent candidate experiences.`;

        try {
            const completion = await this.client.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.1, // Low temperature for consistent JSON
                response_format: { type: 'json_object' } // Force JSON mode
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new Error('Received empty response from Groq AI');
            }

            // Parse JSON directly (Groq JSON mode is reliable)
            const pattern = JSON.parse(content) as OAPattern;
            return pattern;

        } catch (error: any) {
            console.error('Groq AI Pattern Generation Error:', error);
            // Provide more specific error if it's an API key issue
            if (error.status === 401) {
                throw new Error('Invalid Groq API Key. Please check your backend .env file.');
            }
            throw new Error(`Failed to generate OA pattern: ${error.message}`);
        }
    }

    async generatePatternSummary(companyName: string): Promise<string> {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not configured');
        }

        const prompt = `Provide a brief, compelling 2-3 sentence summary of ${companyName}'s current Online Assessment pattern and what candidates should focus on. Be specific and actionable.`;

        try {
            const completion = await this.client.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
            });

            const content = completion.choices[0]?.message?.content;
            if (content) {
                return content.trim();
            }
            throw new Error('No content in AI response');
        } catch (error: any) {
            console.error('Groq AI Summary Generation Error:', error);
            throw new Error(`Failed to generate summary: ${error.message}`);
        }
    }
}

export const aiPatternService = new AIPatternService();
