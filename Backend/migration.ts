import mongoose from 'mongoose';
import Submission from './src/models/Submission';
import Problem from './src/models/Problem';
import CompanyOAQuestion from './src/models/CompanyOAQuestion';

async function migrate() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/CodePrep');
        console.log("Connected to CodePrep DB");

        const submissions = await Submission.find();
        console.log(`Processing ${submissions.length} submissions...`);

        let practiceCount = 0;
        let mockCount = 0;

        for (const sub of submissions) {
            // If it's a 24-char hex string, check if it's an OA Question
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(sub.problemIdentifier);

            let targetSource: 'PRACTICE' | 'MOCK_OA' = 'PRACTICE';

            if (isObjectId) {
                const isOA = await CompanyOAQuestion.exists({ _id: sub.problemIdentifier });
                if (isOA) {
                    targetSource = 'MOCK_OA';
                } else {
                    const isProblem = await Problem.exists({ _id: sub.problemIdentifier });
                    if (isProblem) {
                        targetSource = 'PRACTICE';
                    } else {
                        // If it's an ObjectId but not in Problem collection, it's likely an OA
                        targetSource = 'MOCK_OA';
                    }
                }
            } else {
                // Not an ObjectId (likely a slug or numeric ID), so it's a practice problem
                targetSource = 'PRACTICE';
            }

            if (sub.source !== targetSource) {
                sub.source = targetSource;
                await sub.save();
                if (targetSource === 'PRACTICE') practiceCount++;
                else mockCount++;
            }
        }

        console.log(`Migration complete. Updated ${practiceCount} to PRACTICE, ${mockCount} to MOCK_OA`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
