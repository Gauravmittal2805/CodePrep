import { Router, Request, Response } from 'express';
import { CodeExecutionService } from '../services/codeExecutionService';
import { body, validationResult } from 'express-validator';
import Problem from '../models/Problem';

const router = Router();

// Execute code
router.post(
  '/execute',
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
  [
    body('code').isString().notEmpty(),
    body('language').isIn(['javascript', 'python', 'java', 'cpp']),
    body('problemIdentifier').optional().isString(),
    body('includeDetails').optional().isBoolean(),
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
      const { code, language, testCases, problemIdentifier, includeDetails } = req.body;

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

        const problem = await Problem.findOne({
          $or: [{ slug: problemIdentifier }, { id: problemIdentifier }]
        }).select('test_cases');

        if (!problem) {
          return res.status(404).json({
            success: false,
            error: 'Problem not found'
          });
        }

        effectiveTestCases = (problem.test_cases || []).map((tc: any) => ({
          input: (tc?.input ?? '') as any,
          expectedOutput: String(tc.output ?? '')
        }));
      }

      if (!effectiveTestCases.length) {
        return res.status(400).json({
          success: false,
          error: 'No test cases available for this problem'
        });
      }

      const results = await CodeExecutionService.testCode(code, language, effectiveTestCases);
      
      // Calculate summary
      const passedCount = results.filter(r => r.passed).length;
      const totalTests = results.length;
      const allPassed = passedCount === totalTests;

      const verdict = allPassed ? 'AC' : 'WA';
      
      res.json({
        success: true,
        allPassed,
        passedCount,
        totalTests,
        verdict,
        results: includeDetails ? results : undefined
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

export default router;
