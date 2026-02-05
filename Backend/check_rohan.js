const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    uid: String,
    verdict: String,
    problemIdentifier: String,
    createdAt: Date
});

const ProblemSchema = new mongoose.Schema({
    id: String,
    slug: String,
    difficulty: String
});

const UserSchema = new mongoose.Schema({
    uid: String,
    fullName: String
});

const Submission = mongoose.model('Submission', SubmissionSchema);
const Problem = mongoose.model('Problem', ProblemSchema);
const User = mongoose.model('User', UserSchema);

async function checkRohan() {
    await mongoose.connect('mongodb://127.0.0.1:27017/CodePrep');
    const user = await User.findOne({ fullName: /Rohan/i });
    if (!user) {
        console.log('Rohan not found');
        process.exit(1);
    }
    const uid = user.uid;

    const subs = await Submission.find({ uid }).sort({ createdAt: -1 });
    const acceptedSubs = subs.filter(s => s.verdict === 'AC' || s.verdict === 'Accepted');
    const uniqueSolvedIds = [...new Set(acceptedSubs.map(s => s.problemIdentifier))];

    const allProblems = await Problem.find({
        $or: [
            { id: { $in: uniqueSolvedIds } },
            { slug: { $in: uniqueSolvedIds } }
        ]
    });

    const problemMap = new Map();
    allProblems.forEach(p => {
        problemMap.set(p.id, p.difficulty);
        problemMap.set(p.slug, p.difficulty);
    });

    let easyCount = 0, mediumCount = 0, hardCount = 0;
    uniqueSolvedIds.forEach(id => {
        const diff = problemMap.get(id);
        if (diff === 'Easy') easyCount++;
        else if (diff === 'Medium') mediumCount++;
        else if (diff === 'Hard') hardCount++;
    });

    const accuracy = subs.length > 0 ? Math.round((acceptedSubs.length / subs.length) * 100) : 0;
    
    // Streak
    const now = new Date();
    const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const submissionDates = [...new Set(subs.map(s => {
        const date = new Date(s.createdAt);
        return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    }))].sort((a,b) => b-a);

    let streak = 0;
    if (submissionDates.length > 0 && (submissionDates[0] === todayUTC || submissionDates[0] === todayUTC - 86400000)) {
        streak = 1;
        let last = submissionDates[0];
        for (let i = 1; i < submissionDates.length; i++) {
            if (submissionDates[i] === last - 86400000) { streak++; last = submissionDates[i]; }
            else break;
        }
    }

    // Improvement
    const sevenDaysAgo = todayUTC - (7 * 86400000);
    const fourteenDaysAgo = todayUTC - (14 * 86400000);
    const last7Solved = new Set(acceptedSubs.filter(s => new Date(s.createdAt).getTime() >= sevenDaysAgo).map(s => s.problemIdentifier)).size;
    const prev7Solved = new Set(acceptedSubs.filter(s => {
        const t = new Date(s.createdAt).getTime();
        return t >= fourteenDaysAgo && t < sevenDaysAgo;
    }).map(s => s.problemIdentifier)).size;

    const improvement = last7Solved - prev7Solved;

    console.log(`User: ${user.fullName}`);
    console.log(`Easy: ${easyCount}, Med: ${mediumCount}, Hard: ${hardCount}`);
    console.log(`Acc: ${accuracy}%, Streak: ${streak}, Imp: ${improvement}`);
    console.log(`Scores: Diff=${(easyCount * 20) + (mediumCount * 50) + (hardCount * 100)}, Acc=${accuracy}, Cons=${streak * 10}, Imp=${Math.max(0, improvement * 15)}`);
    console.log(`Total: ${(easyCount * 20) + (mediumCount * 50) + (hardCount * 100) + accuracy + (streak * 10) + Math.max(0, improvement * 15)}`);
    process.exit(0);
}

checkRohan();
