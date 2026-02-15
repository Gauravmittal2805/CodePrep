import express from 'express';
import Submission from '../models/Submission';
import Problem from '../models/Problem';
import User from '../models/User';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Get user dashboard stats
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get all user submissions (Practice only)
        const submissions = await Submission.find({
            uid,
            source: { $nin: ['MOCK_OA', 'CONTEST'] }
        }).sort({ createdAt: -1 });
        console.log(`[Dashboard] Found ${submissions.length} submissions for user ${uid}`);

        // Calculate problems solved (unique accepted problems)
        const acceptedSubmissions = submissions.filter(s => s.verdict === 'AC' || s.verdict === 'Accepted');
        const uniqueProblems = new Set(acceptedSubmissions.map(s => s.problemIdentifier));
        const problemsSolved = uniqueProblems.size;
        console.log(`[Dashboard] Found ${acceptedSubmissions.length} accepted submissions, ${problemsSolved} unique solved problems`);

        // Calculate current and max streak using normalized UTC timestamps
        const submissionDates = new Set(submissions.map(s => {
            const date = new Date(s.createdAt);
            return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        }));

        const sortedDates = Array.from(submissionDates).sort((a, b) => b - a);

        let currentStreak = 0;
        let maxStreak = 0;

        const now = new Date();
        const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        const yesterdayUTC = todayUTC - 86400000;

        if (sortedDates.length > 0) {
            const latestSubDate = sortedDates[0];

            // If the latest submission is today or yesterday, we have a running streak
            if (latestSubDate === todayUTC || latestSubDate === yesterdayUTC) {
                currentStreak = 1;
                let lastCheck = latestSubDate;

                // Count backwards for current streak
                for (let i = 1; i < sortedDates.length; i++) {
                    if (sortedDates[i] === lastCheck - 86400000) {
                        currentStreak++;
                        lastCheck = sortedDates[i];
                    } else {
                        // Gap found, restart/break streak counting
                        break;
                    }
                }
            } else {
                // Gap between now and latest submission is > 1 day, streak is 0
                currentStreak = 0;
            }

            // Calculate Max Streak across entire history
            let tempStreakCount = 1;
            maxStreak = 1;
            for (let i = 1; i < sortedDates.length; i++) {
                if (sortedDates[i] === sortedDates[i - 1] - 86400000) {
                    tempStreakCount++;
                } else {
                    tempStreakCount = 1;
                }
                maxStreak = Math.max(maxStreak, tempStreakCount);
            }
        }

        const todayForStats = new Date(todayUTC);

        // Calculate weekly change (submissions in last 7 days vs previous 7 days)
        const sevenDaysAgo = new Date(todayForStats);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const fourteenDaysAgo = new Date(todayForStats);
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const lastWeekProblems = new Set(
            submissions
                .filter(s => (s.verdict === 'AC' || s.verdict === 'Accepted') && new Date(s.createdAt) >= sevenDaysAgo)
                .map(s => s.problemIdentifier)
        ).size;

        const previousWeekProblems = new Set(
            submissions
                .filter(s => (s.verdict === 'AC' || s.verdict === 'Accepted') && new Date(s.createdAt) >= fourteenDaysAgo && new Date(s.createdAt) < sevenDaysAgo)
                .map(s => s.problemIdentifier)
        ).size;

        const weeklyChange = lastWeekProblems - previousWeekProblems;

        // Calculate REAL Global Rank using the same logic as /leaderboard
        const allProblemsForRank = await Problem.find({}, 'id slug difficulty');
        const problemDifficultyMap = new Map();
        allProblemsForRank.forEach(p => {
            problemDifficultyMap.set(p.id, p.difficulty);
            problemDifficultyMap.set(p.slug, p.difficulty);
        });

        const allSubmissionsForRank = await Submission.find({
            source: { $nin: ['MOCK_OA', 'CONTEST'] }
        }, 'uid verdict problemIdentifier createdAt').sort({ createdAt: -1 });
        const userSubmissionsMap = new Map();
        allSubmissionsForRank.forEach(s => {
            if (!userSubmissionsMap.has(s.uid)) userSubmissionsMap.set(s.uid, []);
            userSubmissionsMap.get(s.uid).push(s);
        });

        const allUsersForRank = await User.find({
            isBlocked: { $ne: true },
            fullName: { $exists: true, $ne: "" }
        }, 'uid');

        const leaderboardScores = allUsersForRank.map(u => {
            const uSubs = userSubmissionsMap.get(u.uid) || [];
            const uAccepted = uSubs.filter((s: any) => s.verdict === 'AC' || s.verdict === 'Accepted');
            const uUniqueSolved = new Set(uAccepted.map((s: any) => s.problemIdentifier));

            let dScore = 0;
            uUniqueSolved.forEach((id: any) => {
                const diff = problemDifficultyMap.get(id);
                if (diff === 'Easy') dScore += 20;
                else if (diff === 'Medium') dScore += 50;
                else if (diff === 'Hard') dScore += 100;
            });

            const uAccuracy = uSubs.length > 0 ? Math.round((uAccepted.length / uSubs.length) * 100) : 0;

            const uDates = new Set(uSubs.map((s: any) => {
                const d = new Date(s.createdAt);
                return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
            }));
            const uSortedDates = Array.from(uDates).sort((a: any, b: any) => (b as number) - (a as number));
            let uStreak = 0;
            if (uSortedDates.length > 0 && ((uSortedDates[0] as number) === todayUTC || (uSortedDates[0] as number) === todayUTC - 86400000)) {
                uStreak = 1;
                let last = uSortedDates[0] as number;
                for (let i = 1; i < uSortedDates.length; i++) {
                    if ((uSortedDates[i] as number) === last - 86400000) { uStreak++; last = uSortedDates[i] as number; }
                    else break;
                }
            }

            const uLast7Solved = new Set(uAccepted.filter((s: any) => new Date(s.createdAt).getTime() >= (sevenDaysAgo as any).getTime()).map((s: any) => s.problemIdentifier)).size;
            const uPrev7Solved = new Set(uAccepted.filter((s: any) => {
                const t = new Date(s.createdAt).getTime();
                return t >= (fourteenDaysAgo as any).getTime() && t < (sevenDaysAgo as any).getTime();
            }).map((s: any) => s.problemIdentifier)).size;
            const uImp = Math.max(0, (uLast7Solved - uPrev7Solved) * 15);

            return { uid: u.uid, score: dScore + uAccuracy + (uStreak * 10) + uImp };
        }).sort((a, b) => b.score - a.score);

        const myRankIndex = leaderboardScores.findIndex(s => s.uid === uid);
        const globalRankNum = myRankIndex !== -1 ? myRankIndex + 1 : leaderboardScores.length + 1;

        // Restore difficulty breakdown
        const solvedProblems = await Problem.find({
            $or: [
                { id: { $in: Array.from(uniqueProblems) } },
                { slug: { $in: Array.from(uniqueProblems) } }
            ]
        }, 'id slug difficulty');

        const difficultyBreakdown = {
            Easy: solvedProblems.filter(p => p.difficulty === 'Easy').length,
            Medium: solvedProblems.filter(p => p.difficulty === 'Medium').length,
            Hard: solvedProblems.filter(p => p.difficulty === 'Hard').length
        };

        // Restore Improvement Rate
        // Restore Improvement Rate
        const last7DaysSubs = submissions.filter((s: any) => new Date(s.createdAt).getTime() >= (sevenDaysAgo as any).getTime());
        const prev7DaysSubs = submissions.filter((s: any) => {
            const t = new Date(s.createdAt).getTime();
            return t >= (fourteenDaysAgo as any).getTime() && t < (sevenDaysAgo as any).getTime();
        });
        const last7DaysAC = last7DaysSubs.filter((s: any) => s.verdict === 'AC' || s.verdict === 'Accepted').length;
        const prev7DaysAC = prev7DaysSubs.filter((s: any) => s.verdict === 'AC' || s.verdict === 'Accepted').length;
        const currentAccuracy = last7DaysSubs.length > 0 ? (last7DaysAC / last7DaysSubs.length) * 100 : 0;
        const pastAccuracy = prev7DaysSubs.length > 0 ? (prev7DaysAC / prev7DaysSubs.length) * 100 : 0;
        const improvementRate = Math.round(currentAccuracy - pastAccuracy);

        res.json({
            problemsSolved,
            totalAccepted: acceptedSubmissions.length,
            difficultyBreakdown,
            weeklyChange: weeklyChange > 0 ? `+${weeklyChange}` : `${weeklyChange}`,
            currentStreak,
            maxStreak,
            improvementRate,
            streakChange: currentStreak > 0 ? '+1' : '0',
            globalRank: `#${globalRankNum.toLocaleString()}`,
            rankChange: weeklyChange > 0 ? `+${Math.abs(weeklyChange * 2)}` : '0',
            totalSubmissions: submissions.length
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Get yearly contribution data
router.get('/contributions', requireAuth, async (req, res) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const submissions = await Submission.find({
            uid,
            source: { $nin: ['MOCK_OA', 'CONTEST'] },
            createdAt: { $gte: oneYearAgo }
        });

        // Group submissions by date using UTC to ensure consistency regardless of server timezone
        const contributionMap: { [key: string]: number } = {};

        submissions.forEach(sub => {
            const date = new Date(sub.createdAt);
            const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
            contributionMap[dateKey] = (contributionMap[dateKey] || 0) + 1;
        });

        console.log(`[Dashboard] Contribution Map (UTC):`, JSON.stringify(contributionMap));

        // Create monthly data structure
        const now = new Date();
        const currentYear = now.getUTCFullYear();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const contributionData = months.map((month, monthIndex) => {
            const daysInMonth = new Date(Date.UTC(currentYear, monthIndex + 1, 0)).getUTCDate();
            const days = Array.from({ length: daysInMonth }, (_, dayIndex) => {
                // Generate date for this specific cell in UTC
                const d = new Date(Date.UTC(currentYear, monthIndex, dayIndex + 1));

                const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

                // Check both current year and last year's same date for trailing view
                const prevYearDateKey = `${currentYear - 1}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

                const countThisYear = contributionMap[dateKey] || 0;
                const countLastYear = contributionMap[prevYearDateKey] || 0;
                const totalCount = countThisYear + countLastYear;

                // Convert count to level (0-4)
                if (totalCount === 0) return 0;
                if (totalCount > 10) return 4;
                if (totalCount > 7) return 3;
                if (totalCount > 4) return 2;
                return 1;
            });

            return { name: month, days };
        });

        res.json({
            contributionData,
            totalSubmissions: submissions.length
        });
    } catch (error) {
        console.error('Error fetching contributions:', error);
        res.status(500).json({ error: 'Failed to fetch contributions' });
    }
});

// Get recent submissions
router.get('/recent-submissions', requireAuth, async (req, res) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const submissions = await Submission.find({
            uid,
            source: { $nin: ['MOCK_OA', 'CONTEST'] }
        })
            .sort({ createdAt: -1 })
            .limit(40);

        const problems = await Problem.find({
            id: { $in: submissions.map(s => s.problemIdentifier) }
        });

        const problemMap = new Map(problems.map(p => [p.id, p]));

        const recentSubmissions = submissions.map(sub => {
            const problem = problemMap.get(sub.problemIdentifier);
            const timeDiff = Date.now() - new Date(sub.createdAt).getTime();
            const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
            const daysAgo = Math.floor(hoursAgo / 24);

            let timeAgo;
            if (daysAgo > 0) {
                timeAgo = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
            } else if (hoursAgo > 0) {
                timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
            } else {
                timeAgo = 'Just now';
            }

            return {
                problem: problem?.title || sub.problemIdentifier,
                status: sub.verdict,
                time: timeAgo,
                language: sub.language
            };
        });

        res.json(recentSubmissions);
    } catch (error) {
        console.error('Error fetching recent submissions:', error);
        res.status(500).json({ error: 'Failed to fetch recent submissions' });
    }
});

// Get latest accepted submissions
router.get('/accepted-submissions', requireAuth, async (req, res) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const acceptedSubmissions = await Submission.find({
            uid,
            source: { $nin: ['MOCK_OA', 'CONTEST'] },
            verdict: { $in: ['AC', 'Accepted'] }
        })
            .sort({ createdAt: -1 })
            .limit(40);

        const problems = await Problem.find({
            id: { $in: acceptedSubmissions.map(s => s.problemIdentifier) }
        });

        const problemMap = new Map(problems.map(p => [p.id, p]));

        const latestAccepted = acceptedSubmissions.map(sub => {
            const problem = problemMap.get(sub.problemIdentifier);
            const timeDiff = Date.now() - new Date(sub.createdAt).getTime();
            const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
            const daysAgo = Math.floor(hoursAgo / 24);

            let timeAgo;
            if (daysAgo > 0) {
                timeAgo = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
            } else if (hoursAgo > 0) {
                timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
            } else {
                timeAgo = 'Just now';
            }

            return {
                problem: problem?.title || sub.problemIdentifier,
                difficulty: problem?.difficulty || 'Medium',
                time: timeAgo
            };
        });

        res.json(latestAccepted);
    } catch (error) {
        console.error('Error fetching accepted submissions:', error);
        res.status(500).json({ error: 'Failed to fetch accepted submissions' });
    }
});

// Get leaderboard
router.get('/leaderboard', requireAuth, async (req, res) => {
    try {
        // Fetch all problems for difficulty mapping
        const allProblems = await Problem.find({}, 'id slug difficulty');
        const problemDifficultyMap = new Map();
        allProblems.forEach(p => {
            problemDifficultyMap.set(p.id, p.difficulty);
            problemDifficultyMap.set(p.slug, p.difficulty);
        });

        // Fetch all submissions for streak and improvement calculation (Practice only)
        const allSubmissions = await Submission.find({
            source: { $nin: ['MOCK_OA', 'CONTEST'] }
        }, 'uid verdict problemIdentifier createdAt').sort({ createdAt: -1 });

        // Group submissions by user
        const userSubmissions = new Map();
        allSubmissions.forEach(s => {
            if (!userSubmissions.has(s.uid)) userSubmissions.set(s.uid, []);
            userSubmissions.get(s.uid).push(s);
        });

        // Fetch user basic info - Filter out users without names
        const users = await User.find({
            isBlocked: { $ne: true },
            fullName: { $exists: true, $ne: "" }
        }, 'uid fullName photoURL');

        const now = new Date();
        const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        const sevenDaysAgo = todayUTC - (7 * 86400000);
        const fourteenDaysAgo = todayUTC - (14 * 86400000);

        const leaderboard = users.map(user => {
            const subs = userSubmissions.get(user.uid) || [];

            // 1. Difficulty Weighting
            const acceptedSubs = subs.filter((s: any) => s.verdict === 'AC' || s.verdict === 'Accepted');
            const uniqueSolvedIds = new Set(acceptedSubs.map((s: any) => s.problemIdentifier));

            let easyCount = 0;
            let mediumCount = 0;
            let hardCount = 0;

            uniqueSolvedIds.forEach((id: any) => {
                const diff = problemDifficultyMap.get(id);
                if (diff === 'Easy') easyCount++;
                else if (diff === 'Medium') mediumCount++;
                else if (diff === 'Hard') hardCount++;
            });

            const difficultyScore = (easyCount * 20) + (mediumCount * 50) + (hardCount * 100);

            // 2. Accuracy
            const accuracy = subs.length > 0
                ? Math.round((acceptedSubs.length / subs.length) * 100)
                : 0;
            const accuracyScore = accuracy * 1;

            // 3. Consistency (Current Streak)
            const submissionDates = new Set(subs.map((s: any) => {
                const date = new Date(s.createdAt);
                return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
            }));
            const sortedDates = Array.from(submissionDates).sort((a: any, b: any) => (b as number) - (a as number));

            let currentStreak = 0;
            if (sortedDates.length > 0) {
                const latestSubDate = sortedDates[0] as number;
                if (latestSubDate === todayUTC || latestSubDate === todayUTC - 86400000) {
                    currentStreak = 1;
                    let lastCheck = latestSubDate;
                    for (let i = 1; i < sortedDates.length; i++) {
                        const currentDate = sortedDates[i] as number;
                        if (currentDate === lastCheck - 86400000) {
                            currentStreak++;
                            lastCheck = currentDate;
                        } else break;
                    }
                }
            }
            const consistencyScore = currentStreak * 10;

            // 4. Improvement (Solved last 7 days vs previous 7 days)
            const last7DaysSolved = new Set(
                acceptedSubs.filter((s: any) => new Date(s.createdAt).getTime() >= (sevenDaysAgo as any))
                    .map((s: any) => s.problemIdentifier)
            ).size;
            const prev7DaysSolved = new Set(
                acceptedSubs.filter((s: any) => {
                    const t = new Date(s.createdAt).getTime();
                    return t >= (fourteenDaysAgo as any) && t < (sevenDaysAgo as any);
                }).map((s: any) => s.problemIdentifier)
            ).size;

            const improvement = last7DaysSolved - prev7DaysSolved;
            const improvementScore = Math.max(0, improvement * 15); // Only positive improvement adds points

            // Final Global Score
            const totalScore = difficultyScore + accuracyScore + consistencyScore + improvementScore;

            return {
                uid: user.uid,
                fullName: user.fullName || 'Anonymous',
                photoURL: user.photoURL,
                problemsSolved: uniqueSolvedIds.size,
                accuracy,
                streak: currentStreak,
                improvement: improvement > 0 ? `+${improvement}` : `${improvement}`,
                score: totalScore,
                stats: {
                    easy: easyCount,
                    medium: mediumCount,
                    hard: hardCount
                }
            };
        })
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Get public leaderboard (no auth required for landing page)
router.get('/public/leaderboard', async (req, res) => {
    try {
        // Fetch all problems for difficulty mapping
        const allProblems = await Problem.find({}, 'id slug difficulty');
        const problemDifficultyMap = new Map();
        allProblems.forEach(p => {
            problemDifficultyMap.set(p.id, p.difficulty);
            problemDifficultyMap.set(p.slug, p.difficulty);
        });

        // Fetch all submissions for streak and improvement calculation (Practice only)
        const allSubmissions = await Submission.find({
            source: { $nin: ['MOCK_OA', 'CONTEST'] }
        }, 'uid verdict problemIdentifier createdAt').sort({ createdAt: -1 });

        // Group submissions by user
        const userSubmissions = new Map();
        allSubmissions.forEach(s => {
            if (!userSubmissions.has(s.uid)) userSubmissions.set(s.uid, []);
            userSubmissions.get(s.uid).push(s);
        });

        // Fetch user basic info - Filter out users without names
        const users = await User.find({
            isBlocked: { $ne: true },
            fullName: { $exists: true, $ne: "" }
        }, 'uid fullName photoURL');

        const now = new Date();
        const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        const sevenDaysAgo = todayUTC - (7 * 86400000);
        const fourteenDaysAgo = todayUTC - (14 * 86400000);

        const leaderboard = users.map(user => {
            const subs = userSubmissions.get(user.uid) || [];

            // 1. Difficulty Weighting
            const acceptedSubs = subs.filter((s: any) => s.verdict === 'AC' || s.verdict === 'Accepted');
            const uniqueSolvedIds = new Set(acceptedSubs.map((s: any) => s.problemIdentifier));

            let easyCount = 0;
            let mediumCount = 0;
            let hardCount = 0;

            uniqueSolvedIds.forEach((id: any) => {
                const diff = problemDifficultyMap.get(id);
                if (diff === 'Easy') easyCount++;
                else if (diff === 'Medium') mediumCount++;
                else if (diff === 'Hard') hardCount++;
            });

            const difficultyScore = (easyCount * 20) + (mediumCount * 50) + (hardCount * 100);

            // 2. Accuracy
            const accuracy = subs.length > 0
                ? Math.round((acceptedSubs.length / subs.length) * 100)
                : 0;
            const accuracyScore = accuracy * 1;

            // 3. Consistency (Current Streak)
            const submissionDates = new Set(subs.map((s: any) => {
                const date = new Date(s.createdAt);
                return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
            }));
            const sortedDates = Array.from(submissionDates).sort((a: any, b: any) => (b as number) - (a as number));

            let currentStreak = 0;
            if (sortedDates.length > 0) {
                const latestSubDate = sortedDates[0] as number;
                if (latestSubDate === todayUTC || latestSubDate === todayUTC - 86400000) {
                    currentStreak = 1;
                    let lastCheck = latestSubDate;
                    for (let i = 1; i < sortedDates.length; i++) {
                        const currentDate = sortedDates[i] as number;
                        if (currentDate === lastCheck - 86400000) {
                            currentStreak++;
                            lastCheck = currentDate;
                        } else break;
                    }
                }
            }
            const consistencyScore = currentStreak * 10;

            // 4. Improvement (Solved last 7 days vs previous 7 days)
            const last7DaysSolved = new Set(
                acceptedSubs.filter((s: any) => new Date(s.createdAt).getTime() >= (sevenDaysAgo as any))
                    .map((s: any) => s.problemIdentifier)
            ).size;
            const prev7DaysSolved = new Set(
                acceptedSubs.filter((s: any) => {
                    const t = new Date(s.createdAt).getTime();
                    return t >= (fourteenDaysAgo as any) && t < (sevenDaysAgo as any);
                }).map((s: any) => s.problemIdentifier)
            ).size;

            const improvement = last7DaysSolved - prev7DaysSolved;
            const improvementScore = Math.max(0, improvement * 15);

            // Final Global Score
            const totalScore = difficultyScore + accuracyScore + consistencyScore + improvementScore;

            return {
                uid: user.uid,
                fullName: user.fullName || 'Anonymous',
                photoURL: user.photoURL,
                problemsSolved: uniqueSolvedIds.size,
                accuracy,
                streak: currentStreak,
                improvement: improvement > 0 ? `+${improvement}` : `${improvement}`,
                score: totalScore,
                stats: {
                    easy: easyCount,
                    medium: mediumCount,
                    hard: hardCount
                }
            };
        })
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching public leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Get DSA Mastery data with weak topics detection
router.get('/dsa-mastery', requireAuth, async (req, res) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Fetch all user submissions (Practice only)
        const submissions = await Submission.find({
            uid,
            source: { $nin: ['MOCK_OA', 'CONTEST'] }
        }).sort({ createdAt: -1 });

        // Fetch all problems to get topic/tag information
        const allProblems = await Problem.find({}, 'id slug title difficulty tags topic');
        const problemMap = new Map(allProblems.map(p => [p.id, p]));

        // Also map by slug for fallback
        allProblems.forEach(p => problemMap.set(p.slug, p));

        // Define main DSA topics
        const mainTopics = [
            'Arrays',
            'Strings',
            'Linked Lists',
            'Trees',
            'Graphs',
            'Dynamic Programming',
            'Sorting',
            'Searching',
            'Hash Table',
            'Stack',
            'Queue',
            'Heap',
            'Greedy',
            'Backtracking',
            'Bit Manipulation',
            'Math',
            'Two Pointers',
            'Sliding Window'
        ];

        // Initialize topic statistics
        const topicStats = new Map();
        mainTopics.forEach(topic => {
            topicStats.set(topic, {
                topic,
                solved: 0,
                total: 0,
                attempts: 0,
                accepted: 0,
                wa: 0,
                tle: 0,
                accuracy: 0,
                subtopics: new Set(),
                isWeak: false,
                weakReasons: []
            });
        });

        // Count total problems per topic
        allProblems.forEach(problem => {
            const topics = [...(problem.tags || []), ...(problem.topic || [])];
            topics.forEach(tag => {
                // Find matching main topic (case-insensitive partial match)
                const matchedTopic = mainTopics.find(mt =>
                    tag.toLowerCase().includes(mt.toLowerCase()) ||
                    mt.toLowerCase().includes(tag.toLowerCase())
                );

                if (matchedTopic && topicStats.has(matchedTopic)) {
                    const stats = topicStats.get(matchedTopic);
                    stats.total++;

                    // Add subtopic
                    if (tag !== matchedTopic) {
                        stats.subtopics.add(tag);
                    }
                }
            });
        });

        // Track solved problems per topic
        const solvedProblems = new Map();

        submissions.forEach(sub => {
            const problem = problemMap.get(sub.problemIdentifier);
            if (!problem) return;

            const topics = [...(problem.tags || []), ...(problem.topic || [])];

            topics.forEach(tag => {
                const matchedTopic = mainTopics.find(mt =>
                    tag.toLowerCase().includes(mt.toLowerCase()) ||
                    mt.toLowerCase().includes(tag.toLowerCase())
                );

                if (matchedTopic && topicStats.has(matchedTopic)) {
                    const stats = topicStats.get(matchedTopic);
                    stats.attempts++;

                    if (sub.verdict === 'AC' || sub.verdict === 'Accepted') {
                        stats.accepted++;

                        if (!solvedProblems.has(sub.problemIdentifier)) {
                            solvedProblems.set(sub.problemIdentifier, []);
                        }
                        solvedProblems.get(sub.problemIdentifier).push(sub.verdict);
                    } else if (sub.verdict === 'WA' || sub.verdict === 'Wrong Answer') {
                        stats.wa++;
                    } else if (sub.verdict === 'TLE' || sub.verdict === 'Time Limit Exceeded') {
                        stats.tle++;
                    }
                }
            });
        });

        // Count unique solved problems per topic
        solvedProblems.forEach((verdicts, problemId) => {
            const problem = problemMap.get(problemId);
            if (!problem) return;

            const topics = [...(problem.tags || []), ...(problem.topic || [])];
            topics.forEach(tag => {
                const matchedTopic = mainTopics.find(mt =>
                    tag.toLowerCase().includes(mt.toLowerCase()) ||
                    mt.toLowerCase().includes(tag.toLowerCase())
                );

                if (matchedTopic && topicStats.has(matchedTopic)) {
                    const stats = topicStats.get(matchedTopic);
                    stats.solved++;
                }
            });
        });

        // Calculate accuracy and detect weak areas
        const MIN_THRESHOLD = 3;
        const weakAreas: any[] = [];

        topicStats.forEach((stats, topic) => {
            // Calculate accuracy
            stats.accuracy = stats.attempts > 0
                ? Math.round((stats.accepted / stats.attempts) * 100)
                : 0;

            // Convert subtopics Set to Array
            stats.subtopics = Array.from(stats.subtopics).slice(0, 3);

            // WEAK DETECTION LOGIC
            const reasons = [];

            // Condition A: Low Accuracy (< 50%)
            if (stats.attempts > 0 && stats.accuracy < 50) {
                stats.isWeak = true;
                reasons.push(`Low accuracy: ${stats.accuracy}%`);
            }

            // Condition B: High WA/TLE (>= 3)
            if (stats.wa + stats.tle >= 3) {
                stats.isWeak = true;
                reasons.push(`${stats.wa + stats.tle} wrong attempts`);
            }

            // Condition C: Topic Ignored (solved < MIN_THRESHOLD)
            if (stats.solved < MIN_THRESHOLD) {
                stats.isWeak = true;
                reasons.push(`Only ${stats.solved} solved`);
            }

            stats.weakReasons = reasons;

            // Add to weak areas if weak
            if (stats.isWeak && stats.total > 0) {
                weakAreas.push({
                    topic: stats.topic,
                    subtopic: stats.subtopics[0] || 'General',
                    solved: stats.solved,
                    total: stats.total,
                    accuracy: stats.accuracy,
                    wrongAttempts: stats.wa + stats.tle,
                    type: stats.solved === 0 ? 'unsolved' :
                        stats.wa + stats.tle >= 3 ? 'wrong' : 'weak',
                    reason: reasons[0] || 'Needs practice'
                });
            }
        });

        // Convert to array and filter out topics with no problems
        const topicProgress = Array.from(topicStats.values())
            .filter(stats => stats.total > 0)
            .sort((a, b) => b.solved - a.solved);

        // Sort weak areas by priority
        const sortedWeakAreas = weakAreas
            .sort((a, b) => {
                const priority = { unsolved: 3, wrong: 2, weak: 1 };
                return (priority[b.type as keyof typeof priority] || 0) - (priority[a.type as keyof typeof priority] || 0);
            })
            .slice(0, 5);

        res.json({
            topicProgress,
            weakAreas: sortedWeakAreas,
            summary: {
                totalTopics: topicProgress.length,
                weakTopics: weakAreas.length,
                averageAccuracy: topicProgress.length > 0
                    ? Math.round(topicProgress.reduce((sum, t) => sum + t.accuracy, 0) / topicProgress.length)
                    : 0
            }
        });
    } catch (error) {
        console.error('Error fetching DSA mastery data:', error);
        res.status(500).json({ error: 'Failed to fetch DSA mastery data' });
    }
});


export default router;

