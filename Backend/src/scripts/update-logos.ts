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
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg"
    },
    {
        companyId: "google",
        logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
    },
    {
        companyId: "microsoft",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
    },
    {
        companyId: "tcs",
        logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg"
    },
    {
        companyId: "infosys",
        logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg"
    },
    {
        companyId: "meta",
        logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"
    }
];

const updateLogos = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CodePrep');
        console.log('Connected to MongoDB for updating logos...');

        for (const company of companies) {
            await Company.updateOne(
                { companyId: company.companyId },
                { $set: { logo: company.logo } }
            );
            console.log(`Updated logo for ${company.companyId}`);
        }

        console.log('Logo update complete.');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error updating logos:', error);
        process.exit(1);
    }
};

updateLogos();
