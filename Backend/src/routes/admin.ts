import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import User from '../models/User';
import Problem from '../models/Problem';
import Submission from '../models/Submission';
import InterviewSession from '../models/InterviewSession';
import admin from 'firebase-admin';

const router = Router();

/**
 * @route   GET /api/admin/stats
 * @desc    Get detailed platform statistics for admin dashboard
 */
router.get('/stats', requireAuth, async (req: Request, res: Response) => {
    try {
        // In a real app, you'd check if req.user.role === 'admin'
        // For now, requireAuth is enough as per previous instructions

        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // 1. Users Stats
        const totalUsers = await User.countDocuments();
        const newSignups = await User.countDocuments({ createdAt: { $gt: yesterday } });
        // Mock active users based on recent submissions
        const activeTodayUids = await Submission.find({ createdAt: { $gt: yesterday } }).distinct('uid');
        const activeToday = activeTodayUids.length;

        // 2. Problems Stats
        const totalProblems = await Problem.countDocuments();
        const publishedProblems = await Problem.countDocuments({ status: 'Published' });
        const draftProblems = await Problem.countDocuments({ status: 'Draft' });
        const reportedProblems = await Problem.countDocuments({ isReported: true });

        // 3. Submissions Stats
        const totalSubmissions = await Submission.countDocuments();
        const acSubmissions = await Submission.countDocuments({ verdict: 'AC' });
        const waSubmissions = await Submission.countDocuments({ verdict: 'WA' });
        const tleSubmissions = await Submission.countDocuments({ verdict: 'TLE' });

        const acceptedRate = totalSubmissions > 0 ? (acSubmissions / totalSubmissions) * 100 : 0;
        const failedRate = totalSubmissions > 0 ? (waSubmissions / totalSubmissions) * 100 : 0;
        const tleRate = totalSubmissions > 0 ? (tleSubmissions / totalSubmissions) * 100 : 0;

        // 4. Contest Stats (Real Data)
        const { Contest } = await import('../models/Contest');

        // Calculate contest statuses dynamically
        const allContests = await Contest.find({ status: { $ne: 'DRAFT' } });
        let activeContests = 0;
        let upcomingContests = 0;
        let finishedContests = 0;

        allContests.forEach(contest => {
            const startTime = new Date(contest.startTime);
            const endTime = new Date(startTime.getTime() + (contest.duration || 0) * 60000);

            if (now >= startTime && now <= endTime) {
                activeContests++;
            } else if (now < startTime) {
                upcomingContests++;
            } else if (now > endTime) {
                finishedContests++;
            }
        });

        // 5. Interviews (Real Data)
        const totalInterviews = await InterviewSession.countDocuments();
        // Calculate most performed interview type
        const typeAggregation = await InterviewSession.aggregate([
            { $group: { _id: "$interviewType", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        let mostPerformedType = typeAggregation.length > 0 ? typeAggregation[0]._id : 'N/A';
        if (mostPerformedType && mostPerformedType !== 'N/A') {
            mostPerformedType = mostPerformedType.charAt(0).toUpperCase() + mostPerformedType.slice(1);
        }
        
        // Calculate average score for completed sessions
        const completedSessions = await InterviewSession.find({ status: 'completed' }, 'aiReport.overallScore');
        const totalScore = completedSessions.reduce((acc, sess) => acc + (sess.aiReport?.overallScore || 0), 0);
        const avgInterviewScore = completedSessions.length > 0 ? Math.round(totalScore / completedSessions.length) : 0;

        // 6. Recent Content Updates
        const recentProblems = await Problem.find({}, 'id title difficulty status createdAt')
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();
            
        const recentContests = await Contest.find({}, 'title status startTime duration createdAt')
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();
            
        const CompanyMockOA = (await import('../models/CompanyMockOA')).default;
        const recentMocks = await CompanyMockOA.find({}, 'title company status createdAt')
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();

        const recentContent = [
            ...recentProblems.map((p: any) => ({
                type: 'Problem',
                id: p.id || p._id.toString().slice(-4),
                title: p.title,
                status: p.status === 'Published' ? 'Published' : 'Draft',
                meta: p.difficulty,
                createdAt: p.createdAt
            })),
            ...recentContests.map((c: any) => {
                const start = new Date(c.startTime);
                const end = new Date(start.getTime() + (c.duration || 120) * 60000); // default 120m if missing
                let dynStatus = c.status;
                if (dynStatus !== 'DRAFT') {
                    if (now >= start && now <= end) dynStatus = 'ACTIVE';
                    else if (now < start) dynStatus = 'UPCOMING';
                    else if (now > end) dynStatus = 'EXPIRED';
                }
                return {
                    type: 'Contest',
                    id: c._id.toString().slice(-4),
                    title: c.title,
                    status: dynStatus,
                    meta: start.toLocaleDateString(),
                    createdAt: c.createdAt
                };
            }),
            ...recentMocks.map((m: any) => ({
                type: 'Mock OA',
                id: m._id.toString().slice(-4),
                title: m.title,
                status: m.status === 'ACTIVE' ? 'Published' : 'Draft',
                meta: m.company,
                createdAt: m.createdAt
            }))
        ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

        // 7. Recent Activity (Live Updates)
        const newUsers = await User.find({}, 'fullName createdAt').sort({ createdAt: -1 }).limit(3).lean();
        const blockedUsers = await User.find({ isBlocked: true }, 'fullName updatedAt').sort({ updatedAt: -1 }).limit(2).lean();
        const recentSubmissions = await Submission.find({ verdict: { $in: ['AC', 'Accepted'] } }, 'uid problemIdentifier createdAt').sort({ createdAt: -1 }).limit(3).lean();

        // Get user names for submissions
        const subUids = [...new Set(recentSubmissions.map(s => s.uid))];
        const subUsers = await User.find({ uid: { $in: subUids } }, 'uid fullName').lean();
        const subUserMap = new Map(subUsers.map(u => [u.uid, u.fullName || 'Unknown']));

        // Get problem titles
        const probIds = [...new Set(recentSubmissions.map(s => s.problemIdentifier))];
        const subProbs = await Problem.find({ $or: [{ id: { $in: probIds } }, { slug: { $in: probIds } }] }, 'id slug title').lean();
        const probMap = new Map();
        subProbs.forEach(p => {
            probMap.set(p.id, p.title);
            probMap.set(p.slug, p.title);
        });

        const recentActivity = [
            ...newUsers.map((u: any) => ({
                user: u.fullName || 'New User',
                action: 'joined the platform',
                time: u.createdAt,
                type: 'signup'
            })),
            ...blockedUsers.map((u: any) => ({
                user: u.fullName || 'Unknown User',
                action: 'was blocked by admin',
                time: u.updatedAt || u.createdAt,
                type: 'blocked'
            })),
            ...recentSubmissions.map((s: any) => ({
                user: subUserMap.get(s.uid) || 'User',
                action: `solved ${probMap.get(s.problemIdentifier) || s.problemIdentifier}`,
                time: s.createdAt,
                type: 'solve'
            }))
        ].sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

        // 8. Admin Specific Notifications
        const adminNotifications = [
            ...recentProblems.map((p: any) => ({
                user: 'Admin',
                action: `published a new problem: ${p.title}`,
                time: p.createdAt,
                type: 'admin'
            })),
            ...recentContests.map((c: any) => ({
                user: 'Admin',
                action: `scheduled a contest: ${c.title}`,
                time: c.createdAt,
                type: 'admin'
            })),
            ...recentMocks.map((m: any) => ({
                user: 'Admin',
                action: `created a mock OA for ${m.company}`,
                time: m.createdAt,
                type: 'admin'
            })),
            ...blockedUsers.map((u: any) => ({
                user: 'Admin',
                action: `blocked user ${u.fullName || 'Unknown'}`,
                time: u.updatedAt || u.createdAt,
                type: 'blocked'
            }))
        ].sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    activeToday: activeToday || Math.floor(totalUsers * 0.1), // Fallback if no submissions
                    newSignups: newSignups
                },
                problems: {
                    total: totalProblems,
                    published: publishedProblems,
                    drafts: draftProblems,
                    reported: reportedProblems
                },
                submissions: {
                    total: totalSubmissions,
                    acceptedRate: acceptedRate.toFixed(1),
                    failedRate: failedRate.toFixed(1),
                    tleRate: tleRate.toFixed(1)
                },
                contests: {
                    active: activeContests,
                    upcoming: upcomingContests,
                    finished: finishedContests
                },
                interviews: {
                    total: totalInterviews,
                    mostPerformedType: mostPerformedType,
                    avgScore: avgInterviewScore,
                    totalCompleted: completedSessions.length
                },
                recentContent: recentContent,
                recentActivity: recentActivity,
                adminNotifications: adminNotifications
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch admin stats' });
    }
});

/**
 * @route   GET /api/admin/admins
 * @desc    Get all admins and moderators
 */
router.get('/admins', requireAuth, async (req: Request, res: Response) => {
    try {
        const admins = await User.find({ role: { $in: ['admin', 'moderator'] } }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        console.error('Admin fetch error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch admins' });
    }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all active users for management
 */
router.get('/users', requireAuth, async (req: Request, res: Response) => {
    try {
        const users = await User.find({ isBlocked: { $ne: true } }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});

/**
 * @route   GET /api/admin/users/blocked
 * @desc    Get all blocked users
 */
router.get('/users/blocked', requireAuth, async (req: Request, res: Response) => {
    try {
        const users = await User.find({ isBlocked: true }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Admin blocked users error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch blocked users' });
    }
});

/**
 * @route   POST /api/admin/users/:uid/block
 * @desc    Block a user
 */
router.post('/users/:uid/block', requireAuth, async (req: Request, res: Response) => {
    const { uid } = req.params;
    const { reason } = req.body;
    console.log(`[Admin] Attempting to block user: ${uid}, reason: ${reason}`);
    try {
        const updatedUser = await User.findOneAndUpdate({ uid }, { isBlocked: true, blockReason: reason || 'Violation of terms' }, { new: true });
        if (!updatedUser) {
            console.error(`[Admin] User not found during block: ${uid}`);
            return res.status(404).json({ success: false, error: 'User not found in database' });
        }

        console.log(`[Admin] Revoking tokens for user: ${uid}`);
        await admin.auth().revokeRefreshTokens(uid);

        res.json({
            success: true,
            message: `User ${uid} has been blocked`
        });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ success: false, error: 'Internal server error while blocking' });
    }
});

/**
 * @route   POST /api/admin/users/:uid/unblock
 * @desc    Unblock a user
 */
router.post('/users/:uid/unblock', requireAuth, async (req: Request, res: Response) => {
    const { uid } = req.params;
    try {
        await User.findOneAndUpdate({ uid }, { isBlocked: false });
        res.json({
            success: true,
            message: `User ${uid} has been unblocked`
        });
    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({ success: false, error: 'Failed to unblock user' });
    }
});

/**
 * @route   POST /api/admin/users/:uid/force-logout
 * @desc    Force logout a user by revoking their refresh tokens
 */
router.post('/users/:uid/force-logout', requireAuth, async (req: Request, res: Response) => {
    const { uid } = req.params;
    try {
        await admin.auth().revokeRefreshTokens(uid);

        // Also update MongoDB to have a reliable local timestamp check
        await User.findOneAndUpdate({ uid }, { lastForcedLogout: new Date() });

        res.json({
            success: true,
            message: `Successfully forced logout for user ${uid}`
        });
    } catch (error) {
        console.error('Force logout error:', error);
        res.status(500).json({ success: false, error: 'Failed to force logout user' });
    }
});

/**
 * @route   POST /api/admin/users/:uid/role
 * @desc    Update user role
 */
router.post('/users/:uid/role', requireAuth, async (req: Request, res: Response) => {
    const { uid } = req.params;
    const { role } = req.body;

    if (!['admin', 'moderator', 'user'].includes(role)) {
        return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    try {
        await User.findOneAndUpdate({ uid }, { role });
        res.json({
            success: true,
            message: `User ${uid} role updated to ${role}`
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ success: false, error: 'Failed to update user role' });
    }
});


/**
 * @route   GET /api/admin/system/health
 * @desc    Get system health metrics
 */
router.get('/system/health', requireAuth, async (req: Request, res: Response) => {
    try {
        // Mock data for system health
        const healthData = {
            server: {
                cpu: Math.floor(Math.random() * 30) + 20,
                memory: Math.floor(Math.random() * 40) + 30,
                disk: 45
            },
            judge: {
                activeWorkers: 4,
                avgRuntime: "145ms"
            },
            pipeline: {
                running: Math.floor(Math.random() * 5),
                queued: 0
            },
            uptime: { system: "99.99%" },
            database: { latency: "16ms" }
        };

        res.json({
            success: true,
            data: healthData
        });
    } catch (error) {
        console.error('System health error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch system health' });
    }
});

/**
 * @route   POST /api/admin/system/diagnostics
 * @desc    Run system diagnostics
 */
router.post('/system/diagnostics', requireAuth, async (req: Request, res: Response) => {
    try {
        // Mock diagnostics
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

        const results = [
            { check: "Database Connectivity", status: "PASS", details: "Connected, Latency 15ms" },
            { check: "Judge Server", status: "PASS", details: "All execution nodes online" },
            { check: "File Storage", status: "PASS", details: "Write permissions verified" },
            { check: "Auth Service", status: "PASS", details: "Firebase Admin SDK operational" },
            { check: "Redis Cache", status: "PASS", details: "Connection stable" }
        ];

        res.json({
            success: true,
            results
        });
    } catch (error) {
        console.error('Diagnostics error:', error);
        res.status(500).json({ success: false, error: 'Diagnostics failed' });
    }
});

/**
 * @route   POST /api/admin/judge/cleanup
 * @desc    Run cleanup on judge system
 */
router.post('/judge/cleanup', requireAuth, async (req: Request, res: Response) => {
    try {
        // Mock cleanup
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work

        res.json({
            success: true,
            summary: {
                staleSubmissionsRemoved: Math.floor(Math.random() * 10),
                tempFilesCleared: "45MB"
            }
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ success: false, error: 'Cleanup failed' });
    }
});

/**
 * @route   GET /api/admin/submissions
 * @desc    Get recent submissions across platform
 */
router.get('/submissions', requireAuth, async (req: Request, res: Response) => {
    try {
        const { limit = 50, page = 1, verdict, contestId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const query: any = {};
        if (contestId) query.contestId = contestId;
        if (verdict) {
            if (verdict === 'FAILED') {
                query.verdict = { $nin: ['AC', 'Accepted'] };
            } else if (verdict === 'RE') {
                query.verdict = 'RE';
            } else {
                query.verdict = verdict;
            }
        }

        const submissions = await Submission.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        // Get unique UIDs and Problem Identifiers to fetch info in bulk
        const uids = [...new Set(submissions.map(s => s.uid))];
        const probIds = [...new Set(submissions.map(s => s.problemIdentifier))];

        const [users, problems] = await Promise.all([
            User.find({ uid: { $in: uids } }, 'uid fullName photoURL email'),
            Problem.find({ $or: [{ id: { $in: probIds } }, { slug: { $in: probIds } }] }, 'id slug title difficulty')
        ]);

        const userMap = new Map(users.map(u => [u.uid, u]));
        const probMap = new Map();
        problems.forEach(p => {
            probMap.set(p.id, p);
            probMap.set(p.slug, p);
        });

        const enrichedSubmissions = submissions.map(sub => {
            const user = userMap.get(sub.uid);
            const problem = probMap.get(sub.problemIdentifier);
            return {
                ...sub.toObject(),
                user: user || { fullName: 'Unknown User', email: sub.uid },
                problem: problem || { title: sub.problemIdentifier, difficulty: 'Medium' }
            };
        });

        const total = await Submission.countDocuments(query);

        res.json({
            success: true,
            data: enrichedSubmissions,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Fetch submissions error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
    }
});

/**
 * @route   GET /api/admin/contests/:contestId/leaderboard
 * @desc    Get leaderboard for a specific contest
 */
router.get('/contests/:contestId/leaderboard', requireAuth, async (req: Request, res: Response) => {
    try {
        const { contestId } = req.params;
        const { Contest } = await import('../models/Contest');
        
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ success: false, error: 'Contest not found' });
        }

        // Get all submissions for this contest
        const submissions = await Submission.find({ contestId })
            .sort({ createdAt: 1 });

        // Calculate leaderboard
        const participantStats = new Map<string, any>();
        
        submissions.forEach(sub => {
            if (!participantStats.has(sub.uid)) {
                participantStats.set(sub.uid, {
                    uid: sub.uid,
                    totalScore: 0,
                    solvedCount: 0,
                    problems: new Map(),
                    lastSubmissionTime: sub.createdAt
                });
            }

            const stats = participantStats.get(sub.uid);
            const probId = sub.problemIdentifier;
            
            if (!stats.problems.has(probId)) {
                stats.problems.set(probId, { score: 0, time: sub.createdAt, attempts: 0, solved: false });
            }

            const probStats = stats.problems.get(probId);
            
            if (!probStats.solved) {
                probStats.attempts++;
                if (sub.verdict === 'AC' || sub.verdict === 'Accepted') {
                    probStats.solved = true;
                    // Find problem score from contest settings if available
                    const contestProb = contest.problems.find((p: any) => p.problemId === probId);
                    const score = contestProb?.score || 100;
                    
                    probStats.score = score;
                    probStats.time = sub.createdAt;
                    stats.totalScore += score;
                    stats.solvedCount++;
                    stats.lastSubmissionTime = sub.createdAt;
                }
            }
        });

        const leaderboard = Array.from(participantStats.values()).map(stats => ({
            uid: stats.uid,
            totalScore: stats.totalScore,
            solvedCount: stats.solvedCount,
            lastSubmissionTime: stats.lastSubmissionTime,
            problems: Object.fromEntries(stats.problems)
        })).sort((a, b) => {
            if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
            return new Date(a.lastSubmissionTime).getTime() - new Date(b.lastSubmissionTime).getTime();
        });

        // Enrich with user info
        const uids = leaderboard.map(l => l.uid);
        const users = await User.find({ uid: { $in: uids } }, 'uid fullName email photoURL');
        const userMap = new Map(users.map(u => [u.uid, u]));

        const enrichedLeaderboard = leaderboard.map(entry => ({
            ...entry,
            user: userMap.get(entry.uid) || { fullName: 'Unknown User', email: entry.uid }
        }));

        res.json({
            success: true,
            data: enrichedLeaderboard
        });
    } catch (error) {
        console.error('Contest leaderboard error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
    }
});

export default router;
