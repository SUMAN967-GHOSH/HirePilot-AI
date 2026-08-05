import { z } from "zod";

export const MatchScoreSchema = z.object({ 
  score: z.number(), 
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  explanation: z.string() 
});

export const RewrittenBulletSchema = z.object({ 
  original: z.string(), 
  rewritten: z.string(),
  reasoning: z.string()
});

export const InterviewQuestionsSchema = z.object({ 
  questions: z.array(z.object({ 
    id: z.string(), 
    question: z.string(), 
    targetedGap: z.string(),
    difficulty: z.enum(["easy", "medium", "hard"])
  })) 
});

export const RubricScoreSchema = z.object({ 
  clarity: z.number().min(1).max(5), 
  relevance: z.number().min(1).max(5), 
  specificity: z.number().min(1).max(5), 
  feedback: z.string() 
});
