import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company';
import path from 'path';
import fs from 'fs';

// Load env
(() => {
    const candidates = [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), 'Backend', '.env'),
    ];

    const envPath = candidates.find((p) => fs.existsSync(p));
    if (envPath) {
        dotenv.config({ path: envPath });
    } else {
        dotenv.config();
    }
})();

const companies = [
    {
        companyId: "amazon",
        name: "Amazon",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg",
        color: "from-orange-500 to-yellow-500",
        oaDifficulty: "Medium–Hard",
        avgQuestions: "2 DSA + 1 MCQ",
        focusAreas: ["Arrays", "Greedy", "Graphs"],
        pattern: [
            { topic: "Arrays", percentage: 32 },
            { topic: "Strings", percentage: 20 },
            { topic: "Graphs", percentage: 12 },
            { topic: "Trees", percentage: 18 },
            { topic: "DP", percentage: 10 },
            { topic: "Others", percentage: 8 },
        ],
        oaSimulation: {
            duration: "75 mins",
            coding: 2,
            debug: 1,
            mcq: 10
        },
        roadmap: [
            { stage: "OA", description: "Online Coding Assessment" },
            { stage: "Technical 1", description: "DSA & Problem Solving" },
            { stage: "HM", description: "Hiring Manager Round (LP)" },
            { stage: "Bar Raiser", description: "System Design & More LP" },
        ]
    },
    {
        companyId: "google",
        name: "Google",
        logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
        color: "from-blue-500 to-green-500",
        oaDifficulty: "Hard",
        avgQuestions: "2 Coding + 1 System Design",
        focusAreas: ["Trees", "DP", "Graphs"],
        pattern: [
            { topic: "Graphs", percentage: 35 },
            { topic: "DP", percentage: 25 },
            { topic: "Trees", percentage: 20 },
            { topic: "Arrays", percentage: 10 },
            { topic: "Others", percentage: 10 },
        ],
        oaSimulation: {
            duration: "90 mins",
            coding: 2,
            debug: 0,
            mcq: 0
        },
        roadmap: [
            { stage: "Phone Screen", description: "Initial Technical Screening" },
            { stage: "Onsite 1", description: "Coding & Algorithms" },
            { stage: "Onsite 2", description: "System Design" },
            { stage: "Behavioral", description: "Googleyness Round" },
        ]
    },
    {
        companyId: "microsoft",
        name: "Microsoft",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
        color: "from-cyan-500 to-blue-600",
        oaDifficulty: "Medium",
        avgQuestions: "3 Coding Problems",
        focusAreas: ["Linked Lists", "Trees", "DP"],
        pattern: [
            { topic: "Trees", percentage: 30 },
            { topic: "Linked Lists", percentage: 25 },
            { topic: "Arrays", percentage: 20 },
            { topic: "Strings", percentage: 15 },
            { topic: "Others", percentage: 10 },
        ],
        oaSimulation: {
            duration: "60 mins",
            coding: 3,
            debug: 0,
            mcq: 0
        },
        roadmap: [
            { stage: "OA", description: "Codility Test" },
            { stage: "Technical 1", description: "Coding Round" },
            { stage: "Technical 2", description: "Problem Solving" },
            { stage: "AA Round", description: "As-Appropriate Round" },
        ]
    },
    {
        companyId: "tcs",
        name: "TCS",
        logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
        color: "from-purple-500 to-indigo-600",
        oaDifficulty: "Easy–Medium",
        avgQuestions: "MCQ + 2 Coding",
        focusAreas: ["Basic DSA", "SQL", "Aptitude"],
        pattern: [
            { topic: "Aptitude", percentage: 40 },
            { topic: "SQL", percentage: 20 },
            { topic: "Arrays", percentage: 20 },
            { topic: "Strings", percentage: 10 },
            { topic: "Basic Math", percentage: 10 },
        ],
        oaSimulation: {
            duration: "120 mins",
            coding: 2,
            debug: 0,
            mcq: 40
        },
        roadmap: [
            { stage: "NQT", description: "National Qualifier Test" },
            { stage: "Technical", description: "TR Round" },
            { stage: "Managerial", description: "MR Round" },
            { stage: "HR", description: "HR Round" },
        ]
    },
    {
        companyId: "infosys",
        name: "Infosys",
        logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
        color: "from-blue-600 to-indigo-700",
        oaDifficulty: "Easy",
        avgQuestions: "3 Coding + MCQ",
        focusAreas: ["Patterns", "Strings", "Math"],
        pattern: [
            { topic: "Math", percentage: 30 },
            { topic: "Strings", percentage: 25 },
            { topic: "Arrays", percentage: 25 },
            { topic: "Logic", percentage: 20 },
        ],
        oaSimulation: {
            duration: "180 mins",
            coding: 3,
            debug: 0,
            mcq: 60
        },
        roadmap: [
            { stage: "HackWithInfy", description: "Coding Contest" },
            { stage: "Technical", description: "Interview Round" },
            { stage: "HR", description: "HR Round" },
        ]
    },
    {
        companyId: "meta",
        name: "Meta",
        logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
        color: "from-blue-400 to-blue-600",
        oaDifficulty: "Hard",
        avgQuestions: "2 Coding (45m)",
        focusAreas: ["Recursion", "Binary Search", "Hash Tables"],
        pattern: [
            { topic: "Binary Search", percentage: 30 },
            { topic: "Recursion", percentage: 25 },
            { topic: "Hash Tables", percentage: 25 },
            { topic: "Arrays", percentage: 20 },
        ],
        oaSimulation: {
            duration: "45 mins",
            coding: 2,
            debug: 0,
            mcq: 0
        },
        roadmap: [
            { stage: "Screening", description: "Technical Phone Screening" },
            { stage: "Onsite 1", description: "Coding Round" },
            { stage: "Onsite 2", description: "Coding Round" },
            { stage: "System Design", description: "Design Round" },
            { stage: "Behavioral", description: "Culture Fit" },
        ]
    }
];

const seedCompanies = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CodePrep');
        console.log('Connected to MongoDB for seeding companies...');

        // Clear existing companies
        await Company.deleteMany({});
        console.log('Cleared existing companies.');

        // Insert new companies
        await Company.insertMany(companies);
        console.log(`Successfully seeded ${companies.length} companies.`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

seedCompanies();
