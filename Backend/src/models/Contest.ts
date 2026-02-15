import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['OPEN', 'COMPANY', 'PRIVATE'], default: 'OPEN' },
    difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'COMPANY_OA'], default: 'BEGINNER' },
    duration: { type: Number, required: true }, // in minutes
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    // Settings
    maxParticipants: { type: Number, default: 0 },
    allowedLanguages: [{ type: String }],
    visibility: { type: String, enum: ['PUBLIC', 'INVITE_ONLY'], default: 'PUBLIC' },
    autoStart: { type: Boolean, default: false },
    enableLeaderboard: { type: Boolean, default: true },
    showLiveRank: { type: Boolean, default: true },
    showTestcaseResults: { type: String, enum: ['PUBLIC_ONLY', 'ALL', 'NONE'], default: 'PUBLIC_ONLY' },

    // Problems
    problems: [{
        problemId: { type: String },
        title: String,
        score: { type: Number, default: 100 },
        timeLimit: Number,
        memoryLimit: Number
    }],

    // Scoring
    scoringMode: { type: String, enum: ['FULL_SCORE', 'PARTIAL', 'ICPC', 'CUSTOM'], default: 'FULL_SCORE' },

    // Security
    strictMode: { type: Boolean, default: false },
    strictOptions: {
        tabSwitchDetection: { type: Boolean, default: true },
        fullscreenEnforcement: { type: Boolean, default: true },
        copyPasteDisable: { type: Boolean, default: true },
        multiDeviceBlock: { type: Boolean, default: true },
        ipLogging: { type: Boolean, default: true },
        randomProblemOrder: { type: Boolean, default: false }
    },

    // Leaderboard
    rankingBasedOn: { type: String, enum: ['SCORE', 'SCORE_TIME', 'SCORE_PENALTY'], default: 'SCORE_TIME' },
    freezeLeaderboard: { type: Boolean, default: false },
    revealAfterContest: { type: Boolean, default: true },

    // Company Specific
    companyDetails: {
        name: String,
        role: String,
        oaPatternType: String,
        readinessWeight: Number
    },

    // Advanced
    aiAnalysis: {
        weakTopicReport: { type: Boolean, default: true },
        companyReadiness: { type: Boolean, default: true },
        skillRadar: { type: Boolean, default: true }
    },
    performanceTagging: {
        enabled: { type: Boolean, default: true },
        tags: [{ type: String }]
    },

    status: { type: String, enum: ['DRAFT', 'UPCOMING', 'ONGOING', 'ENDED'], default: 'DRAFT' },
    createdBy: { type: String, required: true }, // Clerk User ID or Firebase UID
    participants: [{ type: String }] // User IDs
}, { timestamps: true });

export const Contest = mongoose.model('Contest', contestSchema);
