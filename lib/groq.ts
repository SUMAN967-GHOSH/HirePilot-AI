import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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
      description: "Generate targeted interview questions based on identified gaps between resume and job description",
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
                difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
              }
            }
          }
        },
        required: ["questions"]
      }
    }
  }
];
