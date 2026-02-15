import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import CompanyOAQuestion from '../models/CompanyOAQuestion';
import CompanyMockOA from '../models/CompanyMockOA';
import UserMockSubmission from '../models/UserMockSubmission';
import ActiveMockSubmission from '../models/ActiveMockSubmission';
import Company from '../models/Company';
import { CodeExecutionService } from '../services/codeExecutionService';
import mongoose from 'mongoose';

const router = Router();

// --- ADMIN ROUTES ---

/**
 * @route   GET /api/mockoa/admin/list
 * @desc    Get all Mock OAs (for admin)
 */
router.get('/admin/list', requireAuth, async (req: Request, res: Response) => {
    try {
        const mockOAs = await CompanyMockOA.find()
            .populate('questions', 'title difficulty topic')
            .sort({ createdAt: -1 })
            .lean();

        // Fetch logos for companies
        const companyNames = [...new Set(mockOAs.map(oa => oa.company))];
        const companyData = await Company.find({ name: { $in: companyNames } }, 'name logo');
        const logoMap = companyData.reduce((acc, curr) => {
            acc[curr.name] = curr.logo;
            return acc;
        }, {} as Record<string, string>);

        const enrichedMockOAs = mockOAs.map(oa => ({
            ...oa,
            companyLogo: logoMap[oa.company] || null
        }));

        res.json({ success: true, data: enrichedMockOAs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch Mock OAs' });
    }
});

/**
 * @route   GET /api/mockoa/admin/attempts
 * @desc    Get all User Mock OA attempts (for admin)
 */
router.get('/admin/attempts', requireAuth, async (req: Request, res: Response) => {
    try {
        const attempts = await UserMockSubmission.find({ status: 'COMPLETED' })
            .populate('mockOAId', 'title company role duration')
            .sort({ completedAt: -1 })
            .lean();

        // 1. Fetch User Details (since userId is a string UID)
        const userIds = [...new Set(attempts.map(a => a.userId))];
        const users = await mongoose.model('User').find({ uid: { $in: userIds } }, 'uid fullName email photoURL');
        const userMap = users.reduce((acc, curr) => {
            acc[curr.uid] = curr;
            return acc;
        }, {} as Record<string, any>);

        // 2. Fetch Company Logos
        const companyNames = [...new Set(attempts.map(a => (a.mockOAId as any)?.company).filter(Boolean))];
        const companies = await Company.find({ name: { $in: companyNames } }, 'name logo color');

        const companyMap = companies.reduce((acc, curr) => {
            acc[curr.name] = { logo: curr.logo, color: curr.color };
            return acc;
        }, {} as Record<string, any>);

        const enrichedAttempts = attempts.map(attempt => {
            const mockOA = attempt.mockOAId as any;
            const companyInfo = mockOA ? companyMap[mockOA.company] : {};
            const userInfo = userMap[attempt.userId] || { fullName: 'Unknown User', email: 'N/A', photoURL: '' };

            return {
                _id: attempt._id,
                user: userInfo,
                mockOA: mockOA ? {
                    _id: mockOA._id,
                    title: mockOA.title,
                    company: mockOA.company,
                    role: mockOA.role,
                    logo: companyInfo?.logo,
                    color: companyInfo?.color
                } : null,
                score: attempt.score,
                status: attempt.status,
                startedAt: attempt.startedAt,
                completedAt: attempt.completedAt,
                analysis: attempt.analysis
            };
        });

        res.json({ success: true, data: enrichedAttempts });
    } catch (error) {
        console.error('Fetch admin attempts error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch attempts' });
    }
});

/**
 * @route   GET /api/mockoa/admin/analytics
 * @desc    Get aggregated analytics for Mock OAs (for admin)
 */
router.get('/admin/analytics', requireAuth, async (req: Request, res: Response) => {
    try {
        const submissions = await UserMockSubmission.find({ status: 'COMPLETED' })
            .populate('mockOAId', 'company title')
            .lean();

        // 1. Overall Stats
        const totalAttempts = submissions.length;
        const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
        const avgScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;

        // Pass Rate (> 60%)
        const passedCount = submissions.filter(s => s.score >= 60).length;
        const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

        // 2. Attempts Over Time (Last 14 days)
        const attemptsOverTime: Record<string, number> = {};
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            attemptsOverTime[date.toISOString().split('T')[0]] = 0;
        }

        submissions.forEach(s => {
            if (s.completedAt) {
                const dateStr = s.completedAt.toISOString().split('T')[0];
                if (attemptsOverTime[dateStr] !== undefined) {
                    attemptsOverTime[dateStr]++;
                }
            }
        });

        const timeSeriesData = Object.entries(attemptsOverTime).map(([date, count]) => ({ date, count }));

        // 3. Company Performance
        const companyStats: Record<string, { totalScore: number; count: number }> = {};

        submissions.forEach(s => {
            const mockOA = s.mockOAId as any;
            if (mockOA && mockOA.company) {
                if (!companyStats[mockOA.company]) {
                    companyStats[mockOA.company] = { totalScore: 0, count: 0 };
                }
                companyStats[mockOA.company].totalScore += s.score;
                companyStats[mockOA.company].count++;
            }
        });

        const companyPerformance = Object.entries(companyStats)
            .map(([company, stats]) => ({
                company,
                avgScore: Math.round(stats.totalScore / stats.count),
                attempts: stats.count
            }))
            .sort((a, b) => b.avgScore - a.avgScore)
            .slice(0, 5); // Top 5

        // 4. Weak Topics Analysis
        const topicCounts: Record<string, number> = {};
        submissions.forEach(s => {
            if (s.analysis && s.analysis.weakTopics) {
                s.analysis.weakTopics.forEach((topic: string) => {
                    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                });
            }
        });

        const weakTopics = Object.entries(topicCounts)
            .map(([topic, count]) => ({ topic, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8); // Top 8

        res.json({
            success: true,
            data: {
                overview: {
                    totalAttempts,
                    avgScore,
                    passRate,
                    activeUsers: new Set(submissions.map(s => s.userId)).size
                },
                timeSeriesData,
                companyPerformance,
                weakTopics
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
});

/**
 * @route   POST /api/mockoa/questions
 * @desc    Create a new company-specific OA question
 */
router.post('/questions', requireAuth, async (req: Request, res: Response) => {
    try {
        const {
            company, role, title, description, inputFormat,
            outputFormat, constraints, topic, difficulty,
            sampleTestcases, hiddenTestcases, timeLimit, memoryLimit,
            oaType, starterCode, status
        } = req.body;

        const question = new CompanyOAQuestion({
            company, role, title, description, inputFormat,
            outputFormat, constraints, topic, difficulty,
            sampleTestcases, hiddenTestcases, timeLimit, memoryLimit,
            oaType, starterCode, status,
            createdBy: (req as any).user?.uid || 'admin'
        });

        await question.save();
        res.status(201).json({ success: true, data: question });
    } catch (error) {
        console.error('Create OA question error:', error);
        res.status(500).json({ success: false, error: 'Failed to create question' });
    }
});

/**
 * @route   GET /api/mockoa/questions
 * @desc    Get all OA questions (filterable by company)
 */
router.get('/questions', requireAuth, async (req: Request, res: Response) => {
    try {
        const { company } = req.query;
        const query = company ? { company: company as string } : {};
        const questions = await CompanyOAQuestion.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: questions });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch questions' });
    }
});

/**
 * @route   POST /api/mockoa/create
 * @desc    Create a new Mock OA set
 */
router.post('/create', requireAuth, async (req: Request, res: Response) => {
    try {
        const { company, role, title, duration, questions, security } = req.body;

        const mockOA = new CompanyMockOA({
            company, role, title, duration, questions, security,
            createdBy: (req as any).user?.uid || 'admin'
        });

        await mockOA.save();
        res.status(201).json({ success: true, data: mockOA });
    } catch (error) {
        console.error('Create Mock OA error:', error);
        res.status(500).json({ success: false, error: 'Failed to create Mock OA' });
    }
});

// --- USER ROUTES ---

/**
 * @route   GET /api/mockoa/list
 * @desc    Get all active Mock OAs for users
 */
router.get('/list', requireAuth, async (req: Request, res: Response) => {
    try {
        const mockOAs = await CompanyMockOA.find({ status: 'ACTIVE' })
            .populate('questions', 'difficulty topic')
            .sort({ createdAt: -1 })
            .lean(); // Use lean to allow modification

        // Fetch logos for companies
        const companyNames = [...new Set(mockOAs.map(oa => oa.company))];
        const companyData = await Company.find({ name: { $in: companyNames } }, 'name logo');
        const logoMap = companyData.reduce((acc, curr) => {
            acc[curr.name] = curr.logo;
            return acc;
        }, {} as Record<string, string>);

        const enrichedMockOAs = mockOAs.map(oa => ({
            ...oa,
            companyLogo: logoMap[oa.company] || null
        }));

        res.json({ success: true, data: enrichedMockOAs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch Mock OAs' });
    }
});

/**
 * @route   GET /api/mockoa/:id
 * @desc    Get Mock OA details (no questions content yet)
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const mockOA = await CompanyMockOA.findById(req.params.id)
            .populate('questions');
        if (!mockOA) return res.status(404).json({ success: false, error: 'Mock OA not found' });
        res.json({ success: true, data: mockOA });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch details' });
    }
});

/**
 * @route   POST /api/mockoa/:id/start
 * @desc    Start Mock OA (creates progress entry)
 */
router.post('/:id/start', requireAuth, async (req: Request, res: Response) => {
    try {
        const mockOA = await CompanyMockOA.findById(req.params.id).populate('questions');
        if (!mockOA) return res.status(404).json({ success: false, error: 'Mock OA not found' });

        const userId = (req as any).user.uid;

        // Check if user already has an ACTIVE session
        let activeSession = await ActiveMockSubmission.findOne({
            userId,
            mockOAId: mockOA._id
        });

        if (!activeSession) {
            // Create new active session
            activeSession = new ActiveMockSubmission({
                userId,
                mockOAId: mockOA._id,
                startTime: new Date(),
                submissions: (mockOA.questions as any).map((q: any) => ({
                    questionId: q._id,
                    status: 'PENDING'
                }))
            });
            await activeSession.save();
        } else {
            // Restart timer for existing session or just return it?
            // Usually we resume. To restart, delete and recreate.
            // For now, let's resume:
            // But if user wants to restart, frontend might need to handle.
            // Assuming "Resume" behavior for simplicity and robustness.
        }

        res.json({
            success: true,
            data: {
                submissionId: activeSession._id,
                mockOA,
                remainingTime: mockOA.duration * 60 // Should calculate remaining based on startTime if resuming
            }
        });
    } catch (error) {
        console.error('Start OA error:', error);
        res.status(500).json({ success: false, error: 'Failed to start OA' });
    }
});

/**
 * @route   POST /api/mockoa/:submissionId/submit-question
 * @desc    Submit code for a single question in the OA
 */
router.post('/:submissionId/submit-question', requireAuth, async (req: Request, res: Response) => {
    try {
        const { questionId, code, language } = req.body;
        const { submissionId } = req.params;

        // Find in Active Sessions
        let session = await ActiveMockSubmission.findById(submissionId);

        if (!session) {
            return res.status(404).json({ success: false, error: 'Active session not found or expired' });
        }

        const question = await CompanyOAQuestion.findById(questionId);
        if (!question) return res.status(404).json({ success: false, error: 'Question not found' });

        // Run code against test cases
        const testCases = [
            ...question.sampleTestcases.map(tc => ({ input: tc.input, expectedOutput: tc.output })),
            ...question.hiddenTestcases.map(tc => ({ input: tc.input, expectedOutput: tc.output }))
        ];

        const results = await CodeExecutionService.testCode(code, language, testCases);

        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;

        // Update session progress
        const qIndex = session.submissions.findIndex(s => s.questionId.toString() === questionId);
        if (qIndex !== -1) {
            session.submissions[qIndex] = {
                questionId: new mongoose.Types.ObjectId(questionId),
                code,
                language,
                passedCount,
                totalCount,
                status: passedCount === totalCount ? 'AC' : 'WA'
            };
        } else {
            session.submissions.push({
                questionId: new mongoose.Types.ObjectId(questionId),
                code,
                language,
                passedCount,
                totalCount,
                status: passedCount === totalCount ? 'AC' : 'WA'
            });
        }

        await session.save();

        res.json({
            success: true,
            data: {
                passedCount,
                totalCount,
                results: results.map(r => ({ passed: r.passed, error: r.error })) // Don't send hidden inputs back completely? Or just pass/fail
            }
        });
    } catch (error) {
        console.error('Submit question error:', error);
        res.status(500).json({ success: false, error: 'Execution failed' });
    }
});

/**
 * @route   POST /api/mockoa/:submissionId/finish
 * @desc    Finish Mock OA and generate analysis
 */
router.post('/:submissionId/finish', requireAuth, async (req: Request, res: Response) => {
    try {
        // 1. Find the Active Session
        const session = await ActiveMockSubmission.findById(req.params.submissionId).populate({
            path: 'submissions.questionId',
            model: 'CompanyOAQuestion'
        });

        if (!session) return res.status(404).json({ success: false, error: 'Active session not found' });

        // 2. Calculate Final Score & Stats
        let totalPassed = 0;
        let totalPossible = 0;
        const weakTopics: string[] = [];
        const strongTopics: string[] = [];

        session.submissions.forEach((s: any) => {
            const q = s.questionId as any;
            if (!q) return; // Handle deleted questions?

            const qTotalTests = (q.sampleTestcases?.length || 0) + (q.hiddenTestcases?.length || 0);

            totalPassed += (s.passedCount || 0);
            totalPossible += qTotalTests;

            if ((s.passedCount || 0) < qTotalTests) {
                if (q.topic) weakTopics.push(...q.topic);
            } else if (s.status === 'AC') {
                if (q.topic) strongTopics.push(...q.topic);
            }
        });

        const finalScore = totalPossible > 0 ? Math.round((totalPassed / totalPossible) * 100) : 0;

        // 3. Create Permanent Record in UserMockSubmission
        const submission = new UserMockSubmission({
            userId: session.userId,
            mockOAId: session.mockOAId,
            score: finalScore,
            status: 'COMPLETED',
            startedAt: session.startTime,
            completedAt: new Date(),
            submissions: session.submissions, // Copy submissions
            analysis: {
                weakTopics: Array.from(new Set(weakTopics)),
                strongTopics: Array.from(new Set(strongTopics))
            },
            feedback: req.body.feedback
        });

        await submission.save();

        // 4. Delete the Active Session (Cleanup)
        await ActiveMockSubmission.findByIdAndDelete(session._id);

        res.json({ success: true, data: submission });
    } catch (error) {
        console.error('Finish OA error:', error);
        res.status(500).json({ success: false, error: 'Failed to finish OA' });
    }
});

/**
 * @route   GET /api/mockoa/user/history
 * @desc    Get user's past OA attempts
 */
router.get('/user/history', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.uid;
        const history = await UserMockSubmission.find({ userId, status: 'COMPLETED' })
            .populate('mockOAId', 'title company companyId')
            .sort({ completedAt: -1 })
            .lean();

        // Fetch logos for companies in history
        const companyNames = [...new Set(history.map(h => (h.mockOAId as any)?.company).filter(Boolean))];
        const companyData = await Company.find({ name: { $in: companyNames } }, 'name logo');
        const logoMap = companyData.reduce((acc, curr) => {
            acc[curr.name] = curr.logo;
            return acc;
        }, {} as Record<string, string>);

        const enrichedHistory = history.map(h => ({
            ...h,
            companyLogo: (h.mockOAId as any) ? logoMap[(h.mockOAId as any).company] : null
        }));

        res.json({ success: true, data: enrichedHistory });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch history' });
    }
});

export default router;
