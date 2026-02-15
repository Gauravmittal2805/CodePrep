import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import Company from '../models/Company';
import { aiPatternService } from '../services/aiPatternService';

const router = Router();

/**
 * @route   POST /api/companies/:companyId/generate-pattern
 * @desc    Generate AI-powered OA pattern for a company
 * @access  Admin (you may want to add admin check middleware)
 */
router.post('/:companyId/generate-pattern', requireAuth, async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { forceRegenerate } = req.body;

        const company = await Company.findOne({ companyId });
        if (!company) {
            return res.status(404).json({ success: false, error: 'Company not found' });
        }

        // Check if pattern was recently generated (within last 7 days) unless force regenerate
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (
            !forceRegenerate &&
            company.patternLastGenerated &&
            company.patternLastGenerated > sevenDaysAgo &&
            company.aiGeneratedPattern
        ) {
            return res.json({
                success: true,
                data: company.aiGeneratedPattern,
                cached: true,
                generatedAt: company.patternLastGenerated
            });
        }

        // Generate new pattern using AI
        const pattern = await aiPatternService.generateOAPattern(company.name);

        // Update company with new pattern
        company.aiGeneratedPattern = pattern;
        company.patternLastGenerated = new Date();
        await company.save();

        res.json({
            success: true,
            data: pattern,
            cached: false,
            generatedAt: company.patternLastGenerated
        });
    } catch (error: any) {
        console.error('Pattern generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate OA pattern'
        });
    }
});

/**
 * @route   GET /api/companies/:companyId/pattern
 * @desc    Get OA pattern for a company (cached if available)
 * @access  Private
 */
router.get('/:companyId/pattern', requireAuth, async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;

        const company = await Company.findOne({ companyId });
        if (!company) {
            return res.status(404).json({ success: false, error: 'Company not found' });
        }

        if (!company.aiGeneratedPattern) {
            return res.status(404).json({
                success: false,
                error: 'Pattern not generated yet. Please generate first.'
            });
        }

        res.json({
            success: true,
            data: company.aiGeneratedPattern,
            generatedAt: company.patternLastGenerated
        });
    } catch (error: any) {
        console.error('Get pattern error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch pattern'
        });
    }
});

/**
 * @route   POST /api/companies/:companyId/pattern-summary
 * @desc    Generate a brief summary of company OA pattern
 * @access  Private
 */
router.post('/:companyId/pattern-summary', requireAuth, async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;

        const company = await Company.findOne({ companyId });
        if (!company) {
            return res.status(404).json({ success: false, error: 'Company not found' });
        }

        const summary = await aiPatternService.generatePatternSummary(company.name);

        res.json({
            success: true,
            data: { summary }
        });
    } catch (error: any) {
        console.error('Summary generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate summary'
        });
    }
});

export default router;
