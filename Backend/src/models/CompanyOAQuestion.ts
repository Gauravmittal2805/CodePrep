import mongoose, { Schema, Document } from "mongoose";

export interface ITestcase {
    input: string;
    output: string;
}

export interface ICompanyOAQuestion extends Document {
    company: string;
    role: string;
    oaType: string;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
    topic: string[];
    difficulty: "Easy" | "Medium" | "Hard";
    sampleTestcases: ITestcase[];
    hiddenTestcases: ITestcase[];
    timeLimit: number; // in seconds
    memoryLimit: number; // in MB
    starterCode?: {
        [key: string]: string;
    };
    createdBy: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: Date;
    updatedAt: Date;
}

const TestcaseSchema = new Schema({
    input: { type: String, required: true },
    output: { type: String, required: true }
});

const CompanyOAQuestionSchema: Schema = new Schema({
    company: { type: String, required: true },
    role: { type: String, required: true },
    oaType: { type: String, default: "Online Assessment" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    inputFormat: { type: String, required: true },
    outputFormat: { type: String, required: true },
    constraints: { type: String, required: true },
    topic: [{ type: String }],
    difficulty: {
        type: String,
        required: true,
        enum: ["Easy", "Medium", "Hard"]
    },
    sampleTestcases: [TestcaseSchema],
    hiddenTestcases: [TestcaseSchema],
    timeLimit: { type: Number, default: 2 },
    memoryLimit: { type: Number, default: 256 },
    starterCode: {
        type: Object,
        default: {}
    },
    createdBy: { type: String, required: true },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    }
}, {
    timestamps: true
});

export default mongoose.model<ICompanyOAQuestion>("CompanyOAQuestion", CompanyOAQuestionSchema);
