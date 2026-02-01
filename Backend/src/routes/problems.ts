import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import Problem from "../models/Problem";

const router = Router();

/**
 * @route   GET /api/problems
 * @desc    Get all problems with optional filters
 * @access  Private
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const { difficulty, company, tag, search, page = 1, limit = 50 } = req.query;

        // Build filter object
        const filter: any = {};

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

        res.json({
            success: true,
            data: {
                problems,
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
        });

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
