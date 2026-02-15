import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import Company from "../models/Company";

const router = Router();

/**
 * @route   GET /api/companies
 * @desc    Get all companies
 * @access  Private
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const filter: any = {};

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const companies = await Company.find(filter).sort({ name: 1 });

        res.json({
            success: true,
            data: companies
        });
    } catch (error: unknown) {
        console.error('Error fetching companies:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch companies'
        });
    }
});

/**
 * @route   GET /api/companies/:companyId
 * @desc    Get company details by ID
 * @access  Private
 */
router.get('/:companyId', requireAuth, async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const company = await Company.findOne({ companyId });

        if (!company) {
            return res.status(404).json({
                success: false,
                error: 'Company not found'
            });
        }

        res.json({
            success: true,
            data: company
        });
    } catch (error: unknown) {
        console.error('Error fetching company details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch company details'
        });
    }
});

export default router;
