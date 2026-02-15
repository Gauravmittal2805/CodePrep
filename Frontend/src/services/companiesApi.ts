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

export interface TopicPattern {
    topic: string;
    percentage: number;
}

export interface RoadmapStep {
    stage: string;
    description: string;
}

export interface OASimulation {
    duration: string;
    coding: number;
    debug: number;
    mcq: number;
}

export interface Company {
    _id: string;
    companyId: string;
    name: string;
    logo: string;
    website?: string;
    color: string;
    oaDifficulty: string;
    avgQuestions: string;
    focusAreas: string[];
    pattern: TopicPattern[];
    oaSimulation: OASimulation;
    roadmap: RoadmapStep[];
    createdAt: string;
    updatedAt: string;
}

export const companiesApi = {
    getAll: async (search?: string): Promise<Company[]> => {
        const response = await api.get('/companies', {
            params: { search }
        });
        return response.data.data;
    },

    getById: async (companyId: string): Promise<Company> => {
        const response = await api.get(`/companies/${companyId}`);
        return response.data.data;
    }
};
