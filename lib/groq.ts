import Groq from "groq-sdk";

// Use a dummy key during build time if environment variable is not set
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_build_key",
});

export const tools = [
  {
    type: "function" as const,
    function: {
      name: "computeMatchScore",
      description: "Analyze the semantic similarity between resume content and job requirements and return a structured match assessment",
      parameters: {
        type: "object",
        properties: {
          score: { type: "number", description: "Match percentage 0-100" },
          matchedSkills: { type: "array", items: { type: "string" } },
          missingSkills: { type: "array", items: { type: "string" } },
          explanation: { type: "string" }
        },
        required: ["score", "matchedSkills", "missingSkills", "explanation"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "rewriteBullet",
      description: "Rewrite a resume bullet point to better align with job description language",
      parameters: {
        type: "object",
        properties: {
          original: { type: "string" },
          rewritten: { type: "string" },
          reasoning: { type: "string" }
        },
        required: ["original", "rewritten", "reasoning"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "generateInterviewQuestions",
      description: "Generate 5 targeted multiple-choice interview questions based on identified gaps between resume and job description. Include aptitude and tech stack questions. Multiple options can be correct.",
      parameters: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                question: { type: "string" },
                targetedGap: { type: "string" },
                options: { 
                  type: "array",
                  items: { type: "string" }
                },
                correctAnswers: {
                  type: "array",
                  items: { type: "string" },
                  description: "The options that are correct. Must match the exact string from the options array."
                },
                explanation: { type: "string", description: "Why these answers are correct." }
              },
              required: ["id", "question", "targetedGap", "options", "correctAnswers", "explanation"]
            }
          }
        },
        required: ["questions"]
      }
    }
  }
];
