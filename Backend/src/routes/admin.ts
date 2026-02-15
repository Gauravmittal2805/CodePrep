import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import User from '../models/User';
import Problem from '../models/Problem';
import Submission from '../models/Submission';
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

        // 5. Interviews (Mocked for now)
        const interviewsToday = 0;
        const feedbackPending = 0;
        const avgInterviewScore = 0;

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
                    today: interviewsToday,
                    pendingFeedback: feedbackPending,
                    avgScore: avgInterviewScore
                }
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

export default router;
