import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import Comment from "../models/Comment";

const router = Router();

/**
 * @route   GET /api/discussions/:problemIdentifier
 * @desc    Get all comments for a problem
 */
router.get('/:problemIdentifier', requireAuth, async (req: Request, res: Response) => {
    try {
        const { problemIdentifier } = req.params;
        const comments = await Comment.find({ problemIdentifier }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('Fetch comments error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch comments' });
    }
});

/**
 * @route   POST /api/discussions
 * @desc    Post a new comment
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { problemIdentifier, content, parentId } = req.body;
        const { uid, name, picture } = req.user;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Content is required' });
        }

        const comment = await Comment.create({
            problemIdentifier,
            uid,
            userName: name || 'Anonymous',
            userPhoto: picture,
            content,
            parentId
        });

        res.json({
            success: true,
            data: comment
        });
    } catch (error) {
        console.error('Post comment error:', error);
        res.status(500).json({ success: false, error: 'Failed to post comment' });
    }
});

export default router;
