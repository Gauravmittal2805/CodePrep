import axios from 'axios';
import { auth } from '@/lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
};
