# AI-Powered Company OA Pattern Generator

## Overview
This feature uses AI (Claude by Anthropic) to generate the latest Online Assessment patterns for companies, providing students with up-to-date insights about interview preparation.

## Features Implemented

### Backend
1. **AI Pattern Service** (`/Backend/src/services/aiPatternService.ts`)
   - Uses Claude 3.5 Sonnet for generating OA patterns
   - Structured prompts for consistent, high-quality outputs
   - Methods:
     - `generateOAPattern()` - Full pattern analysis
     - `generatePatternSummary()` - Brief summary

2. **API Routes** (`/Backend/src/routes/companyPatterns.ts`)
   - `POST /api/company-patterns/:companyId/generate-pattern` - Generate/fetch pattern
   - `GET /api/company-patterns/:companyId/pattern` - Get cached pattern
   - `POST /api/company-patterns/:companyId/pattern-summary` - Generate summary
   - Smart caching: Patterns cached for 7 days to reduce API costs

3. **Database Schema Updates** (`/Backend/src/models/Company.ts`)
   - Added `aiGeneratedPattern` field for storing pattern data
   - Added `patternLastGenerated` timestamp for cache management

### Frontend
1. **AI Pattern Component** (`/Frontend/src/components/company/AICompanyPattern.tsx`)
   - Beautiful, premium UI matching your design system
   - Displays:
     - Question Distribution (count, difficulty, time)
     - Topic Focus Areas (with percentages and descriptions)
     - Common Patterns (tags)
     - Assessment Structure (duration, navigation, etc.)
     - Recent Trends (2024-2026 data)
     - Success Tips (actionable advice)
   - Generate/Refresh button with loading states
   - Cache indicator showing when pattern was generated

## Setup Instructions

### 1. Get Anthropic API Key
1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to "API Keys" section
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### 2. Configure Environment Variable
Add to `/Backend/.env`:
```env
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

### 3. Install Dependencies
```bash
cd Backend
npm install @anthropic-ai/sdk
```

### 4. Restart Backend Server
```bash
npm run dev
```

## Usage

### In Company Detail Page
```tsx
import AICompanyPattern from '@/components/company/AICompanyPattern';

// Inside your company detail page:
<AICompanyPattern 
  companyId={company.companyId} 
  companyName={company.name} 
/>
```

### Admin Panel Integration
You can add this to the "Company OA Patterns" section in your admin dashboard where admins can:
1. Generate patterns for all companies
2. Review and edit AI-generated content
3. Manually override if needed

## API Endpoints

### Generate Pattern
```bash
POST /api/company-patterns/:companyId/generate-pattern
Authorization: Bearer <firebase-token>
Body: { "forceRegenerate": false }

Response:
{
  "success": true,
  "data": { ...pattern },
  "cached": false,
  "generatedAt": "2026-02-07T..."
}
```

### Get Cached Pattern
```bash
GET /api/company-patterns/:companyId/pattern
Authorization: Bearer <firebase-token>

Response:
{
  "success": true,
  "data": { ...pattern },
  "generatedAt": "2026-02-07T..."
}
```

## Pattern Structure
```typescript
{
  questionDistribution: {
    totalQuestions: "2-3 coding problems",
    difficulty: "1 Easy, 1-2 Medium",
    timeAllocation: "30-45 minutes per question"
  },
  topicFocus: [
    {
      topic: "Arrays & Strings",
      percentage: "40%",
      description: "Focus on manipulation, two-pointer techniques"
    }
  ],
  commonPatterns: ["Two-pointer", "Sliding window", "HashMap"],
  assessmentStructure: {
    duration: "90 minutes",
    navigation: "Can jump between questions",
    partialCredit: "Yes, based on test cases passed",
    environment: "HackerRank/CodeSignal"
  },
  recentTrends: [
    "Increased focus on optimization problems",
    "More emphasis on clean, maintainable code"
  ],
  successTips: [
    "Practice time complexity analysis",
    "Focus on edge case handling"
  ]
}
```

## Cost Management
- **Caching**: Patterns cached for 7 days by default
- **Force Regenerate**: Use `forceRegenerate: true` to bypass cache
- **Model**: Using Claude 3.5 Sonnet (~$3/$15 per million tokens)
- **Estimated Cost**: ~$0.01-0.02 per pattern generation

## Security
- All endpoints protected with `requireAuth` middleware
- Firebase token required
- Consider adding admin-only middleware for pattern generation

## Next Steps
1. Add to company detail pages
2. Create admin interface for bulk generation
3. Add ability to edit/override AI-generated content
4. Track usage metrics
5. Add rate limiting for cost control

## Troubleshooting

### Module not found error
```bash
cd Backend
npm install @anthropic-ai/sdk
```

### API Key not working
- Ensure key starts with `sk-ant-`
- Check key is active in Anthropic console
- Verify `.env` file is in correct location
- Restart server after adding key

### Pattern not generating
- Check Anthropic API status
- Verify API key has credits
- Check server logs for detailed errors
