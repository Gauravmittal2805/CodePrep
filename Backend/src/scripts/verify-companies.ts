import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company';
import path from 'path';
import fs from 'fs';

(() => {
    const candidates = [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), 'Backend', '.env'),
    ];
    const envPath = candidates.find((p) => fs.existsSync(p));
    if (envPath) dotenv.config({ path: envPath });
})();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CodePrep');
        const count = await Company.countDocuments();
        console.log(`Verified: ${count} companies in database.`);
        const companies = await Company.find({}, 'name companyId');
        console.log('Companies:', companies.map(c => `${c.name} (${c.companyId})`).join(', '));
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

verify();
