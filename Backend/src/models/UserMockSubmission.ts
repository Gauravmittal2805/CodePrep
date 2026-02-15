import mongoose, { Schema, Document } from "mongoose";

export interface IUserMockSubmission extends Document {
    userId: string;
    mockOAId: mongoose.Types.ObjectId;
    score: number;
    status: "STARTED" | "COMPLETED";
    startedAt: Date;
    completedAt?: Date;
    submissions: {
        questionId: mongoose.Types.ObjectId;
        code: string;
        language: string;
        passedCount: number;
        totalCount: number;
        status: string;
    }[];
    analysis: {
        weakTopics: string[];
        strongTopics: string[];
    };
    feedback?: {
        difficulty: string;
        rating: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserMockSubmissionSchema: Schema = new Schema({
    userId: { type: String, required: true },
    mockOAId: { type: Schema.Types.ObjectId, ref: "CompanyMockOA", required: true },
    score: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["STARTED", "COMPLETED"],
        default: "STARTED"
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    submissions: [{
        questionId: { type: Schema.Types.ObjectId, ref: "CompanyOAQuestion" },
        code: { type: String },
        language: { type: String },
        passedCount: { type: Number, default: 0 },
        totalCount: { type: Number, default: 0 },
        status: { type: String }
    }],
    analysis: {
        weakTopics: [{ type: String }],
        strongTopics: [{ type: String }]
    },
    feedback: {
        difficulty: { type: String },
        rating: { type: Number }
    }
}, {
    timestamps: true
});

export default mongoose.model<IUserMockSubmission>("UserMockSubmission", UserMockSubmissionSchema);
