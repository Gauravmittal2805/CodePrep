import mongoose from 'mongoose';
import Submission from './src/models/Submission';

async function debug() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/CodePrep');
        const submissions = await Submission.find({}, 'problemIdentifier source verdict').sort({ createdAt: -1 }).limit(20);
        console.log("Recent Submissions Check:");
        if (submissions.length === 0) {
            console.log("No submissions found in DB.");
        }
        submissions.forEach(s => {
            console.log(`ID: ${s.problemIdentifier} | Source: ${s.source} | Verdict: ${s.verdict}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
