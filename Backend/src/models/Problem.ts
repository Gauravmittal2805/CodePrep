import mongoose, { Schema, Document } from "mongoose";

export interface ITestCase {
    input: string;
    output: string;
    isHidden?: boolean;
}

export interface IHiddenTestCase extends ITestCase {
    description?: string;
    points?: number;
}

export interface IProblem extends Document {
    id: string;
    title: string;
    slug: string;
    difficulty: "Easy" | "Medium" | "Hard";
    pattern: string;
    topic: string[];
    companies: string[];
    statement: string;
    input_format: string;
    output_format: string;
    constraints: string[];
    sample_input: string;
    sample_output: string;
    explanation: string;
    approach: string[];
    time_complexity: string;
    space_complexity: string;
    tags: string[];
    test_cases: ITestCase[];
    hidden_test_cases: IHiddenTestCase[];
    judge_type: string;
    notes: string;
    source: string;
    createdAt: Date;
    updatedAt: Date;
}

const TestCaseSchema = new Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
});

const HiddenTestCaseSchema = new Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
    description: { type: String },
    points: { type: Number, default: 10 }
});

const ProblemSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: {
        type: String,
        required: true,
        enum: ["Easy", "Medium", "Hard"]
    },
    pattern: { type: String, required: true },
    topic: [{ type: String }],
    companies: [{ type: String }],
    statement: { type: String, required: true },
    input_format: { type: String, required: true },
    output_format: { type: String, required: true },
    constraints: [{ type: String }],
    sample_input: { type: String, required: true },
    sample_output: { type: String, required: true },
    explanation: { type: String, required: true },
    approach: [{ type: String }],
    time_complexity: { type: String, required: true },
    space_complexity: { type: String, required: true },
    tags: [{ type: String }],
    test_cases: [TestCaseSchema],
    hidden_test_cases: { 
        type: [HiddenTestCaseSchema],
        default: Array(10).fill(null).map(() => ({
            input: '',
            output: '',
            description: 'Hidden test case',
            points: 10
        }))
    },
    judge_type: { type: String, required: true },
    notes: { type: String },
    source: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IProblem>("Problem", ProblemSchema);
