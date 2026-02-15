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

export interface Problem {
    _id: string;
    id: string;
    title: string;
    slug: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    companies: string[];
    userStatus?: {
        status: 'solved' | 'todo';
    };
}

export const problemsApi = {
    getProblems: async (params: any): Promise<{ problems: Problem[]; pagination: any }> => {
        const response = await api.get('/problems', { params });
        return response.data.data;
    },

    getByCompany: async (companyName: string): Promise<Problem[]> => {
        // We'll pass the company name as a query param
        const response = await api.get('/problems', {
            params: { company: companyName, limit: 100 }
        });
        return response.data.data.problems;
    }
};
