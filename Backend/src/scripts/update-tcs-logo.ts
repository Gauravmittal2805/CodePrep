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

const updateTcsLogo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CodePrep');
        console.log('Connected to MongoDB for updating TCS logo...');

        const result = await Company.updateOne(
            { companyId: "tcs" },
            { $set: { logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg" } }
        );

        console.log(`Updated logo for TCS. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error updating TCS logo:', error);
        process.exit(1);
    }
};

updateTcsLogo();
