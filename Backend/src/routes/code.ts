import { Router, Request, Response } from 'express';
import { CodeExecutionService } from '../services/codeExecutionService';
import { body, validationResult } from 'express-validator';
import Problem from '../models/Problem';
import Submission from '../models/Submission';
import CompanyOAQuestion from '../models/CompanyOAQuestion';
import { requireAuth } from '../middleware/auth';
import mongoose from 'mongoose';

const router = Router();

// Execute code
router.post(
  '/execute',
  requireAuth,
  [
    body('code').isString().notEmpty(),
    body('language').isIn(['javascript', 'python', 'java', 'cpp']),
    body('input').optional().custom((value) => {
      if (typeof value === 'string') return true;
      if (Array.isArray(value)) return true;
      return false;
    })
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { code, language, input } = req.body;
      const result = await CodeExecutionService.executeCode(code, language, input);

      res.json({
        success: !result.isError,
        output: result.output,
        error: result.error,
        executionTime: result.executionTime
      });
    } catch (error) {
      console.error('Execution error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during code execution'
      });
    }
  }
);

// Test code against test cases
router.post(
  '/test',
  requireAuth,
  [
    body('code').isString().notEmpty(),
    body('language').isIn(['javascript', 'python', 'java', 'cpp']),
    body('problemIdentifier').optional().isString(),
    body('includeDetails').optional().isBoolean(),
    body('runHidden').optional().isBoolean(), // Add runHidden flag
    body('contestId').optional().isString(),
    body('testCases').optional().isArray(),
    body('testCases.*.input').optional().custom((value) => {
      if (typeof value === 'string') return true;
      if (Array.isArray(value)) return true;
      return false;
    }),
    body('testCases.*.expectedOutput').optional().isString()
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { code, language, testCases, problemIdentifier, includeDetails, runHidden, contestId } = req.body;

      console.log('Test Request:', { problemIdentifier, runHidden, includeDetails });

      let effectiveTestCases: Array<{ input: string; expectedOutput: string }> = [];

      if (Array.isArray(testCases) && testCases.length > 0) {
        effectiveTestCases = testCases;
      } else {
        if (!problemIdentifier || typeof problemIdentifier !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'problemIdentifier is required when testCases are not provided'
          });
        }

        let problem: any = await Problem.findOne({
          $or: [{ slug: problemIdentifier }, { id: problemIdentifier }]
        }).select('test_cases hidden_test_cases');

        let isOAQuestion = false;

        if (!problem) {
          // Check if it's a Company OA Question
          problem = await CompanyOAQuestion.findById(problemIdentifier);
          if (problem) isOAQuestion = true;
        }

        if (!problem) {
          return res.status(404).json({
            success: false,
            error: 'Problem not found'
          });
        }

        if (isOAQuestion) {
          const sourceTestCases = runHidden ? (problem.hiddenTestcases || []) : (problem.sampleTestcases || []);
          effectiveTestCases = sourceTestCases.map((tc: any) => ({
            input: tc.input || '',
            expectedOutput: String(tc.output || '')
          }));
        } else {
          // Robust selection logic for regular problems
          const rawPublic = problem.test_cases || [];
          const rawHidden = problem.hidden_test_cases || [];

          const effectivePublic = rawPublic.filter((tc: any) => !tc.isHidden);
          let effectiveHidden = rawHidden.length > 0
            ? rawHidden.filter((tc: any) => tc.input && tc.input.trim() !== '' && tc.output !== undefined)
            : rawPublic.filter((tc: any) => tc.isHidden);

          const sourceTestCases = runHidden ? effectiveHidden : effectivePublic;

          effectiveTestCases = sourceTestCases.map((tc: any) => ({
            input: (tc?.input ?? '') as any,
            expectedOutput: String(tc.output ?? '')
          }));
        }
      }

      if (!effectiveTestCases.length) {
        return res.status(400).json({
          success: false,
          error: runHidden ? 'No hidden test cases available for this problem' : 'No test cases available for this problem'
        });
      }

      const results = await CodeExecutionService.testCode(code, language, effectiveTestCases);

      // Calculate summary
      const passedCount = results.filter(r => r.passed).length;
      const totalTests = results.length;
      const allPassed = passedCount === totalTests;

      let verdict = allPassed ? 'AC' : 'WA';

      // Check for TLE in individual results
      const hasTLE = results.some(r => r.error && r.error.toLowerCase().includes('timed out'));
      if (!allPassed && hasTLE) {
        verdict = 'TLE';
      }

      // Sanitize results for hidden test cases
      let finalResults = results;
      if (runHidden) {
        finalResults = results.map(r => ({
          ...r,
          input: 'Hidden',
          expectedOutput: 'Hidden',
          actualOutput: 'Hidden',
          error: r.passed ? '' : (r.error ? r.error : 'Test case failed')
        }));
      }

      // Save submission if it's a "Submit" run (runHidden = true)
      if (runHidden && req.user) {
        try {
          // Check if it's a practice problem or an OA question to set the source correctly
          const isObjectId = mongoose.Types.ObjectId.isValid(problemIdentifier);
          let isPracticeProblem = false;

          if (isObjectId) {
            isPracticeProblem = await Problem.exists({ _id: problemIdentifier }) !== null;
          }

          if (!isPracticeProblem) {
            isPracticeProblem = await Problem.exists({
              $or: [{ slug: problemIdentifier }, { id: problemIdentifier }]
            }) !== null;
          }

          await Submission.create({
            uid: req.user.uid,
            problemIdentifier,
            code,
            language,
            verdict,
            passedCount,
            totalTests,
            executionTime: Math.max(...results.map(r => r.executionTime), 0),
            results: finalResults,
            source: req.body.contestId ? 'CONTEST' : (isPracticeProblem ? 'PRACTICE' : 'MOCK_OA'),
            contestId: req.body.contestId
          });
        } catch (dbError) {
          console.error('Failed to save submission:', dbError);
          // Don't fail the response just because DB save failed
        }
      }

      res.json({
        success: true,
        allPassed,
        passedCount,
        totalTests,
        verdict,
        results: includeDetails || runHidden ? finalResults : undefined
      });
    } catch (error) {
      console.error('Test execution error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during test execution'
      });
    }
  }
);

// Get submission history for a problem
router.get('/submissions/:problemIdentifier', requireAuth, async (req: Request, res: Response) => {
  try {
    const { problemIdentifier } = req.params;
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const submissions = await Submission.find({
      uid,
      problemIdentifier,
      source: { $nin: ['MOCK_OA', 'CONTEST'] }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching submissions'
    });
  }
});

/**
 * @route   GET /api/code/user-stats
 * @desc    Get user's activity dates and current streak
 */
router.get('/user-stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Fetch unique days where user has at least one successful submission
    const submissions = await Submission.find({
      uid,
      verdict: 'AC',
      source: { $nin: ['MOCK_OA', 'CONTEST'] }
    }).select('createdAt');

    // Extract unique dates (normalized to midnight)
    const dateSet = new Set<number>();
    submissions.forEach(sub => {
      const d = new Date(sub.createdAt);
      dateSet.add(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime());
    });

    const sortedDates = Array.from(dateSet).sort((a, b) => b - a); // Newest first

    // Calculate streak
    let currentStreak = 0;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;

    if (sortedDates.length > 0) {
      const mostRecent = sortedDates[0];

      // Streak continues if most recent activity is today or yesterday
      if (mostRecent === today || mostRecent === yesterday) {
        currentStreak = 1;
        // Walk back through sorted dates
        for (let i = 0; i < sortedDates.length - 1; i++) {
          if (sortedDates[i] - sortedDates[i + 1] === 86400000) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        activityDates: sortedDates.map(ts => new Date(ts)),
        currentStreak
      }
    });
  } catch (error) {
    console.error('Fetch user stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user stats' });
  }
});

export default router;
