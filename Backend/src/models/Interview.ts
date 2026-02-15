import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
    title: string;
    companyTag: string;
    type: string; // coding, technical, hr, etc
    scheduleType: string;
    duration: number;
    participants: {
        accessType: string;
        limit: number;
    };
    questions: {
        text: string;
        type: string;
        difficulty: string;
    }[];
    config: {
        questionSource: string; // auto, manual, resume
        difficulty: string;
        aiFollowUp: boolean;
        interviewerMode: string;
    };
    pdfFile?: string; // Path or URL
    status: string; // scheduled, live, completed
    createdAt: Date;
}

const InterviewSchema: Schema = new Schema({
    title: { type: String, required: true },
    companyTag: { type: String, default: 'custom' },
    type: { type: String, required: true },
    scheduleType: { type: String, default: 'instant' },
    duration: { type: Number, default: 60 },
    participants: {
        accessType: { type: String, default: 'private' },
        limit: { type: Number, default: 1 }
    },
    questions: [{
        text: { type: String },
        type: { type: String },
        difficulty: { type: String }
    }],
    config: {
        questionSource: { type: String, default: 'auto' },
        difficulty: { type: String, default: 'adaptive' },
        aiFollowUp: { type: Boolean, default: true },
        interviewerMode: { type: String, default: 'corporate' }
    },
    pdfFile: { type: String },
    status: { type: String, default: 'scheduled' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IInterview>('Interview', InterviewSchema);
