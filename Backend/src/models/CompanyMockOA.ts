import mongoose, { Schema, Document } from "mongoose";

export interface ICompanyMockOA extends Document {
    company: string;
    role: string;
    title: string;
    duration: number; // in minutes
    questions: mongoose.Types.ObjectId[];
    security: {
        shuffleQuestions: boolean;
        shuffleTestcases: boolean;
        disableCopyPaste: boolean;
    };
    status: "ACTIVE" | "INACTIVE";
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const CompanyMockOASchema: Schema = new Schema({
    company: { type: String, required: true },
    role: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes
    questions: [{ type: Schema.Types.ObjectId, ref: "CompanyOAQuestion" }],
    security: {
        shuffleQuestions: { type: Boolean, default: true },
        shuffleTestcases: { type: Boolean, default: true },
        disableCopyPaste: { type: Boolean, default: true }
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    },
    createdBy: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model<ICompanyMockOA>("CompanyMockOA", CompanyMockOASchema);
