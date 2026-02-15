import express from 'express';
import admin from 'firebase-admin';
import { Contest } from '../models/Contest';
import { requireAuth, adminCheck } from '../middleware/auth';

const router = express.Router();

import Problem from '../models/Problem';
import User from '../models/User';
import { sendContestInvitationEmail } from '../utils/emailService';

// Create Contest (Admin Only)
router.post('/', requireAuth, adminCheck, async (req, res) => {
    try {
        const { problems, ...rest } = req.body;

        // Process problems: Save custom ones, reference existing ones
        const processedProblems = await Promise.all(problems.map(async (p: any) => {
            if (p.isCustom) {
                // Save custom problem to main problems collection with ContestOnly status
                const newProb = new Problem({
                    ...p,
                    status: 'ContestOnly',
                    isReported: false
                });
                const savedProb = await newProb.save();
                return {
                    problemId: savedProb.id,
                    title: p.title,
                    score: p.score || 100,
                    timeLimit: p.timeLimit || 1,
                    memoryLimit: p.memoryLimit || 256
                };
            } else {
                // Existing problem
                return {
                    problemId: p.id || p._id,
                    title: p.title,
                    score: p.score || 100,
                    timeLimit: p.timeLimit || 1,
                    memoryLimit: p.memoryLimit || 256
                };
            }
        }));

        const contestData = {
            ...rest,
            problems: processedProblems,
            // @ts-ignore
            createdBy: req.user.uid
        };

        const newContest = new Contest(contestData);
        await newContest.save();

        res.status(201).json({ success: true, data: newContest });
    } catch (error: any) {
        console.error('Contest Creation Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get All Contests (Public/Protected)
router.get('/', async (req, res) => {
    try {
        // Optional Auth check for visibility filtering
        const authHeader = req.header('Authorization');
        let userId = null;
        let isAdmin = false;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const decodedToken = await admin.auth().verifyIdToken(token);
                userId = decodedToken.uid;
                isAdmin = !!(decodedToken.admin === true || decodedToken.email?.includes('admin'));
            } catch (e: any) {
                console.error("Optional auth failed:", e.message);
            }
        }

        let query: any = { status: { $ne: 'DRAFT' } };

        // If not admin, restrict visibility
        if (!isAdmin) {
            query.$or = [
                { visibility: 'PUBLIC' },
                { visibility: { $ne: 'PUBLIC' }, participants: userId }
            ];
        }

        const contests = await Contest.find(query).sort({ startTime: 1 });
        console.log(`Found ${contests.length} contests for user ${userId || 'guest'} (isAdmin: ${isAdmin})`);

        // Dynamically update status based on current time
        const now = new Date();
        const updatedContests = contests.map(contest => {
            const startTime = new Date(contest.startTime);
            const endTime = new Date(startTime.getTime() + (contest.duration || 0) * 60000);

            let status = 'UPCOMING';
            if (now >= startTime && now <= endTime) {
                status = 'ONGOING';
            } else if (now > endTime) {
                status = 'ENDED';
            }

            return {
                ...contest.toObject(),
                status
            };
        });

        res.json({ success: true, data: updatedContests });
    } catch (error: any) {
        console.error('Error fetching contests:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Admin Contests (Admin Only)
router.get('/admin', requireAuth, adminCheck, async (req, res) => {
    try {
        const contests = await Contest.find().sort({ createdAt: -1 });
        res.json({ success: true, data: contests });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Contest
router.patch('/:id', requireAuth, adminCheck, async (req, res) => {
    try {
        const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!contest) return res.status(404).json({ success: false, error: 'Contest not found' });
        res.json({ success: true, data: contest });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Invite Users to Contest
router.post('/:id/invite', requireAuth, adminCheck, async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds)) {
            return res.status(400).json({ success: false, error: 'userIds array is required' });
        }

        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ success: false, error: 'Contest not found' });

        // Identify newly invited users (who weren't already participants)
        const existingParticipants = contest.participants || [];
        const newInviteIds = userIds.filter(id => !existingParticipants.includes(id));

        console.log(`[Contest Invite] Total userIds sent: ${userIds.length}`);
        console.log(`[Contest Invite] Existing participants: ${existingParticipants.length}`);
        console.log(`[Contest Invite] New unique invites: ${newInviteIds.length}`);

        // Add all users to participants array
        const updatedParticipants = [...new Set([...existingParticipants, ...userIds])];
        contest.participants = updatedParticipants;
        await contest.save();

        // Send emails to all users in the selection (useful if resending or testing)
        if (userIds.length > 0) {
            const usersToEmail = await User.find({ uid: { $in: userIds } });
            console.log(`[Contest Invite] Sending emails to ${usersToEmail.length} users...`);
            usersToEmail.forEach(u => {
                sendContestInvitationEmail(u.email, u.fullName, contest.title, contest.startTime.toISOString());
            });
        }

        res.json({ success: true, data: contest });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Single Contest (Public/Protected)
router.get('/:id', async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ success: false, error: 'Contest not found' });

        // Dynamically update status based on current time
        const now = new Date();
        const startTime = new Date(contest.startTime);
        const endTime = new Date(startTime.getTime() + (contest.duration || 0) * 60000);

        let status = 'UPCOMING';
        if (now >= startTime && now <= endTime) {
            status = 'ONGOING';
        } else if (now > endTime) {
            status = 'ENDED';
        }

        res.json({
            success: true,
            data: {
                ...contest.toObject(),
                status
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Contest Leaderboard
router.get('/:id/leaderboard', async (req, res) => {
    try {
        const contestId = req.params.id;
        const contest = await Contest.findById(contestId);
        if (!contest) return res.status(404).json({ success: false, error: 'Contest not found' });

        const startTime = new Date(contest.startTime);

        // Fetch all successful submissions for this contest
        const Submission = (await import('../models/Submission')).default;
        const submissions = await Submission.find({
            contestId,
            verdict: 'AC'
        }).sort({ createdAt: 1 });

        // Group by user
        const userStats: Record<string, any> = {};

        for (const sub of submissions) {
            if (!userStats[sub.uid]) {
                userStats[sub.uid] = {
                    uid: sub.uid,
                    totalScore: 0,
                    totalTime: 0,
                    solvedProblems: new Set(),
                    lastSubmissionTime: sub.createdAt
                };
            }

            // If this is the first AC for this problem by this user
            if (!userStats[sub.uid].solvedProblems.has(sub.problemIdentifier)) {
                userStats[sub.uid].solvedProblems.add(sub.problemIdentifier);

                // Find contest problem to get score
                const contestProb = contest.problems.find(p => p.problemId === sub.problemIdentifier);
                const score = contestProb?.score || 100;

                userStats[sub.uid].totalScore += score;

                // Calculate time penalty (minutes since contest start)
                const timeDiff = Math.floor((sub.createdAt.getTime() - startTime.getTime()) / 60000);
                userStats[sub.uid].totalTime += Math.max(0, timeDiff);

                // Track latest submission time for tie-breaking
                if (sub.createdAt > userStats[sub.uid].lastSubmissionTime) {
                    userStats[sub.uid].lastSubmissionTime = sub.createdAt;
                }
            }
        }

        // Convert to array and sort
        let leaderboard = await Promise.all(Object.values(userStats).map(async (stat) => {
            const user = await User.findOne({ uid: stat.uid }).select('fullName email photoURL');
            return {
                ...stat,
                userName: user?.fullName || 'Hidden User',
                userAvatar: user?.photoURL,
                solvedCount: stat.solvedProblems.size,
                solvedProblems: Array.from(stat.solvedProblems)
            };
        }));

        // Sort by Score (Desc), then by Time (Asc)
        leaderboard.sort((a, b) => {
            if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
            return a.totalTime - b.totalTime;
        });

        res.json({ success: true, data: leaderboard });
    } catch (error: any) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
