export interface ContestProblem {
    problemId: string;
    score: number;
    timeLimit?: number; // override
    memoryLimit?: number; // override
}

export interface Contest {
    title: string;
    description: string;
    type: 'OPEN' | 'COMPANY' | 'PRIVATE';
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'COMPANY_OA';
    duration: number; // in minutes
    startTime: string; // ISO date string
    endTime: string; // ISO date string

    // Settings
    maxParticipants: number; // 0 for unlimited
    allowedLanguages: string[]; // ['cpp', 'java', 'python']
    visibility: 'PUBLIC' | 'INVITE_ONLY';
    autoStart: boolean;
    enableLeaderboard: boolean;
    showLiveRank: boolean;
    showTestcaseResults: 'PUBLIC_ONLY' | 'ALL' | 'NONE';

    // Problems
    problems: ContestProblem[];

    // Scoring
    scoringMode: 'FULL_SCORE' | 'PARTIAL' | 'ICPC' | 'CUSTOM';

    // Security
    securityMode: 'STRICT' | 'NORMAL'; // Simplified from user request, but can be expanded
    strictOptions?: {
        tabSwitchDetection: boolean;
        fullscreenEnforcement: boolean;
        copyPasteDisable: boolean;
        multiDeviceBlock: boolean;
        ipLogging: boolean;
        randomProblemOrder: boolean;
    };

    // Leaderboard Settings
    leaderboardMode: 'SCORE' | 'SCORE_TIME' | 'SCORE_PENALTY';
    freezeLeaderboard: boolean;
    revealAfterContest: boolean;

    // Company Specific
    company?: string;
    role?: string;
    oaPatternType?: string;
    companyReadinessWeight?: number;

    // Advanced
    aiAnalysis?: {
        weakTopicReport: boolean;
        companyReadiness: boolean;
        skillRadar: boolean;
    };
    performanceTagging?: {
        enabled: boolean;
        tags: string[];
    };

    status: 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'ENDED';
    createdBy: string;
    createdAt?: string;
    updatedAt?: string;
}
