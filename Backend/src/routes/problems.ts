import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import Problem from "../models/Problem";
import Submission from "../models/Submission";

import User from "../models/User";

const router = Router();

/**
 * @route   GET /api/problems
 * @desc    Get all problems with optional filters
 * @access  Private
 */
router.get('/', requireAuth, async (req: any, res) => {
    try {
        const { difficulty, company, tag, search, status, page = 1, limit = 50 } = req.query;
        const uid = req.user?.uid;

        // Fetch user role
        const user = await User.findOne({ uid });
        // Check MongoDB role OR email pattern (matching frontend logic)
        const isAdminOrMod = (user && (user.role === 'admin' || user.role === 'moderator')) ||
            (req.user?.email && req.user.email.includes('admin'));



        // Build filter object
        const filter: any = {};

        // If not admin/mod, FORCE Published status
        if (!isAdminOrMod) {
            filter.status = 'Published';
        } else {
            // If admin/mod, check if status is provided
            if (status && status !== 'all') {
                filter.status = status;
            }
        }



        if (difficulty && difficulty !== 'all') {
            filter.difficulty = difficulty;
        }

        if (company && company !== 'all') {
            filter.companies = { $in: [company] };
        }

        if (tag) {
            filter.tags = { $in: [tag] };
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { statement: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Fetch problems with pagination
        const problems = await Problem.find(filter)
            .select('-test_cases') // Exclude test cases from list view
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        // Get total count for pagination
        const total = await Problem.countDocuments(filter);

        // Fetch user's unique solved problems
        const solvedProblemIds = uid ? await Submission.find({
            uid,
            verdict: 'AC'
        }).distinct('problemIdentifier') : [];

        const problemsWithStatus = problems.map(p => {
            const isSolved = solvedProblemIds.includes(p.slug) || solvedProblemIds.includes(p.id);
            return {
                ...p.toObject(),
                userStatus: { status: isSolved ? 'solved' : 'todo' }
            };
        });

        res.json({
            success: true,
            data: {
                problems: problemsWithStatus,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });

    } catch (error: unknown) {
        console.error('Error fetching problems:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

        res.status(500).json({
            success: false,
            error: 'Failed to fetch problems',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});

/**
 * @route   GET /api/problems/:identifier
 * @desc    Get problem details by ID or slug
 * @access  Private
 */
router.get('/:identifier', requireAuth, async (req, res) => {
    try {
        const { identifier } = req.params;

        // Validate identifier
        if (!identifier || typeof identifier !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid problem identifier'
            });
        }

        // Try to find by slug first, then by id
        const problem = await Problem.findOne({
            $or: [
                { slug: identifier },
                { id: identifier }
            ]
        })
            .select('+test_cases +hidden_test_cases'); // Include both test cases and hidden test cases

        if (!problem) {
            return res.status(404).json({
                success: false,
                error: 'Problem not found'
            });
        }

        // Combine test cases and hidden test cases
        const allTestCases = [
            ...(problem.test_cases || []).map(tc => ({
                ...tc.toObject(),
                isHidden: false
            })),
            ...(problem.hidden_test_cases || []).map(tc => ({
                ...tc.toObject(),
                isHidden: true
            }))
        ];

        res.json({
            success: true,
            data: {
                ...problem.toObject(),
                test_cases: allTestCases,
                hidden_test_cases: undefined // Remove the original hidden_test_cases field
            }
        });

    } catch (error: unknown) {
        console.error('Error fetching problem details:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

        res.status(500).json({
            success: false,
            error: 'Failed to fetch problem details',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});

export default router;

/**
 * @route   POST /api/problems
 * @desc    Create a new problem
 * @access  Private
 */
router.post('/', requireAuth, async (req: any, res) => {
    try {
        const {
            id, title, slug, difficulty, pattern, topic, companies,
            statement, input_format, output_format, constraints,
            sample_input, sample_output, explanation, approach,
            time_complexity, space_complexity, tags,
            test_cases, hidden_test_cases, judge_type,
            notes, source, starterCode, status
        } = req.body;

        // Basic validation
        if (!id || !title || !slug || !statement || !difficulty) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields (id, title, slug, statement, difficulty)'
            });
        }

        // Check if problem exists
        const existingProblem = await Problem.findOne({ $or: [{ id }, { slug }] });
        if (existingProblem) {
            return res.status(400).json({
                success: false,
                error: 'Problem with this ID or Slug already exists'
            });
        }

        const newProblem = new Problem({
            id, title, slug, difficulty, pattern, topic, companies,
            statement, input_format, output_format, constraints,
            sample_input, sample_output, explanation, approach,
            time_complexity, space_complexity, tags,
            test_cases, hidden_test_cases, judge_type,
            notes, source, starterCode, status: status || 'Draft',
            isReported: false
        });

        await newProblem.save();

        res.status(201).json({
            success: true,
            data: newProblem
        });

    } catch (error: unknown) {
        console.error('Error creating problem:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({
            success: false,
            error: 'Failed to create problem',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});

/**
 * @route   PATCH /api/problems/:identifier
 * @desc    Update problem details (e.g., status)
 * @access  Private
 */
router.patch('/:identifier', requireAuth, async (req: any, res) => {
    try {
        const { identifier } = req.params;
        const updates = req.body;

        // Find and update provided fields
        const problem = await Problem.findOneAndUpdate(
            { $or: [{ id: identifier }, { slug: identifier }] },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!problem) {
            return res.status(404).json({
                success: false,
                error: 'Problem not found'
            });
        }

        res.json({
            success: true,
            data: problem
        });

    } catch (error: unknown) {
        console.error('Error updating problem:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({
            success: false,
            error: 'Failed to update problem',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});
