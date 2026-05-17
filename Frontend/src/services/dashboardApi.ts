import axios from 'axios';
import { auth } from '@/lib/firebase';

const rawUrl = import.meta.env.VITE_API_URL || 'https://codeprep-4-k73y.onrender.com';
const API_BASE_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "") + '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface DashboardStats {
    problemsSolved: number;
    totalAccepted: number;
    difficultyBreakdown: {
        Easy: number;
        Medium: number;
        Hard: number;
    };
    weeklyChange: string;
    currentStreak: number;
    maxStreak: number;
    improvementRate: number;
    streakChange: string;
    globalRank: string;
    rankChange: string;
    totalSubmissions: number;
    contestScore: number;
    contestsParticipated: number;
}

export interface ContributionMonth {
    name: string;
    days: number[];
}

export interface ContributionData {
    contributionData: ContributionMonth[];
    totalSubmissions: number;
}

export interface RecentSubmission {
    problem: string;
    status: string;
    time: string;
    language: string;
}

export interface AcceptedSubmission {
    problem: string;
    difficulty: string;
    time: string;
}

export interface LeaderboardEntry {
    uid: string;
    fullName: string;
    photoURL?: string;
    problemsSolved: number;
    acceptedSubmissions: number;
    totalSubmissions: number;
    accuracy: number;
    score: number;
    rank: number;
    stats?: {
        easy: number;
        medium: number;
        hard: number;
        interviews: number;
    };
}

export interface TopicProgress {
    topic: string;
    solved: number;
    total: number;
    attempts: number;
    accepted: number;
    wa: number;
    tle: number;
    accuracy: number;
    subtopics: string[];
    isWeak: boolean;
    weakReasons: string[];
}

export interface WeakArea {
    topic: string;
    subtopic: string;
    solved: number;
    total: number;
    accuracy: number;
    wrongAttempts: number;
    type: 'unsolved' | 'wrong' | 'weak';
    reason: string;
}

export interface CompanyReadiness {
    companyId: string;
    name: string;
    logo: string;
    color: string;
    readinessScore: number;
    focusAreas: string[];
}

export interface InterviewSession {
    _id: string;
    interviewType: string;
    difficulty: string;
    status: string;
    createdAt: string;
    aiReport?: {
        overallScore: number;
        hireRecommendation: string;
    };
}

export interface DSAMasteryData {
    topicProgress: TopicProgress[];
    weakAreas: WeakArea[];
    summary: {
        totalTopics: number;
        weakTopics: number;
        averageAccuracy: number;
    };
}


export const dashboardApi = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },

    getContributions: async (): Promise<ContributionData> => {
        const response = await api.get('/dashboard/contributions');
        return response.data;
    },

    getRecentSubmissions: async (): Promise<RecentSubmission[]> => {
        const response = await api.get('/dashboard/recent-submissions');
        return response.data;
    },

    getAcceptedSubmissions: async (): Promise<AcceptedSubmission[]> => {
        const response = await api.get('/dashboard/accepted-submissions');
        return response.data;
    },

    getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
        const response = await api.get('/dashboard/leaderboard');
        return response.data;
    },

    getDSAMastery: async (): Promise<DSAMasteryData> => {
        const response = await api.get('/dashboard/dsa-mastery');
        return response.data;
    },

    getCompanyReadiness: async (): Promise<CompanyReadiness[]> => {
        const response = await api.get('/dashboard/company-readiness');
        return response.data;
    },

    getInterviewHistory: async (): Promise<InterviewSession[]> => {
        const response = await api.get('/ai/history');
        return response.data.data;
    },
};
