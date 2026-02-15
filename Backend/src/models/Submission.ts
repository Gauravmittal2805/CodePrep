import mongoose, { Schema, Document } from "mongoose";

export interface ISubmission extends Document {
    uid: string;
    problemIdentifier: string;
    code: string;
    language: string;
    verdict: string;
    passedCount: number;
    totalTests: number;
    executionTime: number;
    memory?: number;
    results?: any[];
    source?: 'PRACTICE' | 'MOCK_OA' | 'CONTEST';
    contestId?: string;
    createdAt: Date;
}

const SubmissionSchema: Schema = new Schema({
    uid: { type: String, required: true, index: true },
    problemIdentifier: { type: String, required: true, index: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    verdict: { type: String, required: true },
    passedCount: { type: Number, required: true },
    totalTests: { type: Number, required: true },
    executionTime: { type: Number, default: 0 },
    memory: { type: Number },
    results: { type: Array },
    source: { type: String, enum: ['PRACTICE', 'MOCK_OA', 'CONTEST'], default: 'PRACTICE', index: true },
    contestId: { type: String, index: true }
}, {
    timestamps: true
});

// Create compound index for fast queries of user's submissions for a specific problem
SubmissionSchema.index({ uid: 1, problemIdentifier: 1, createdAt: -1 });

export default mongoose.model<ISubmission>("Submission", SubmissionSchema);
