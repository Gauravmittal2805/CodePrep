import mongoose, { Schema, Document } from "mongoose";

export interface IActiveMockSubmission extends Document {
    userId: string;
    mockOAId: mongoose.Types.ObjectId;
    startTime: Date;
    submissions: {
        questionId: mongoose.Types.ObjectId;
        code: string;
        language: string;
        passedCount: number;
        totalCount: number;
        status: string;
    }[];
    // We don't need analysis/score here yet
    createdAt: Date;
    updatedAt: Date;
}

const ActiveMockSubmissionSchema: Schema = new Schema({
    userId: { type: String, required: true },
    mockOAId: { type: Schema.Types.ObjectId, ref: "CompanyMockOA", required: true },
    startTime: { type: Date, default: Date.now },
    submissions: [{
        questionId: { type: Schema.Types.ObjectId, ref: "CompanyOAQuestion" },
        code: { type: String },
        language: { type: String },
        passedCount: { type: Number, default: 0 },
        totalCount: { type: Number, default: 0 },
        status: { type: String }
    }]
}, {
    timestamps: true
});

// TTL Index: Auto-delete active sessions after 24 hours to keep DB clean
ActiveMockSubmissionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model<IActiveMockSubmission>("ActiveMockSubmission", ActiveMockSubmissionSchema);
