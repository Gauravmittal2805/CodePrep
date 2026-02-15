import mongoose, { Schema, Document } from "mongoose";

export interface ITopicPattern {
    topic: string;
    percentage: number;
}

export interface IRoadmapStep {
    stage: string;
    description: string;
}

export interface IOASimulation {
    duration: string;
    coding: number;
    debug: number;
    mcq: number;
}

export interface ICompany extends Document {
    companyId: string; // unique slug e.g. 'amazon'
    name: string;
    logo: string;
    website?: string;
    color: string;
    oaDifficulty: string;
    avgQuestions: string;
    focusAreas: string[];
    pattern: ITopicPattern[];
    oaSimulation: IOASimulation;
    roadmap: IRoadmapStep[];
    aiGeneratedPattern?: any; // AI-generated OA pattern data
    patternLastGenerated?: Date; // When the pattern was last generated
    createdAt: Date;
    updatedAt: Date;
}

const TopicPatternSchema = new Schema({
    topic: { type: String, required: true },
    percentage: { type: Number, required: true }
}, { _id: false });

const RoadmapStepSchema = new Schema({
    stage: { type: String, required: true },
    description: { type: String, required: true }
}, { _id: false });

const OASimulationSchema = new Schema({
    duration: { type: String, required: true },
    coding: { type: Number, required: true },
    debug: { type: Number, required: true },
    mcq: { type: Number, required: true }
}, { _id: false });

const CompanySchema: Schema = new Schema({
    companyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    logo: { type: String, required: true },
    website: { type: String, required: false },
    color: { type: String, required: true },
    oaDifficulty: { type: String, required: true },
    avgQuestions: { type: String, required: true },
    focusAreas: [{ type: String }],
    pattern: [TopicPatternSchema],
    oaSimulation: OASimulationSchema,
    roadmap: [RoadmapStepSchema],
    aiGeneratedPattern: { type: Schema.Types.Mixed, required: false },
    patternLastGenerated: { type: Date, required: false }
}, {
    timestamps: true
});

export default mongoose.model<ICompany>("Company", CompanySchema);
