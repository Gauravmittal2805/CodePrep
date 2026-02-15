import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewSession extends Document {
    uid: string;
    interviewType: string;
    difficulty: string;
    companyTag: string;
    aiFocusTags: string[];
    resumeContent: string;
    transcript: { role: string; text: string; timestamp: Date }[];
    questionWiseAnswers: { question: string; answer: string; score: number; feedback: string; duration: number }[];
    metrics: {
        wpm: number;
        fillerWordCount: number;
        silencePauses: number;
        interruptions: number;
        totalDuration: number;
    };
    aiReport: {
        overallScore: number;
        technicalScore: number;
        communicationScore: number;
        confidenceScore: number;
        strengths: string[];
        weaknesses: string[];
        detailedFeedback: string[];
        improvementPlan: string[];
        hireRecommendation: string;
    };
    status: string; // completed, in-progress
    createdAt: Date;
}

const InterviewSessionSchema: Schema = new Schema({
    uid: { type: String, required: true },
    interviewType: { type: String, required: true },
    difficulty: { type: String, required: true },
    companyTag: { type: String, default: 'General' },
    aiFocusTags: [{ type: String }],
    resumeContent: { type: String },
    transcript: [{
        role: { type: String },
        text: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    questionWiseAnswers: [{
        question: { type: String },
        answer: { type: String },
        score: { type: Number },
        feedback: { type: String },
        duration: { type: Number }
    }],
    metrics: {
        wpm: { type: Number, default: 0 },
        fillerWordCount: { type: Number, default: 0 },
        silencePauses: { type: Number, default: 0 },
        interruptions: { type: Number, default: 0 },
        totalDuration: { type: Number, default: 0 }
    },
    aiReport: {
        overallScore: { type: Number },
        technicalScore: { type: Number },
        communicationScore: { type: Number },
        confidenceScore: { type: Number },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        detailedFeedback: [{ type: String }],
        improvementPlan: [{ type: String }],
        hireRecommendation: { type: String }
    },
    status: { type: String, default: 'in-progress' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
