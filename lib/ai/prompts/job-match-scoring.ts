import type { AIMessage } from "../provider";

export function buildJobMatchScoringPrompt(
  resumeText: string,
  jobDescription: string
): AIMessage[] {
  return [
    {
      role: "system",
      content: `You are a job-resume matching expert. Analyze the candidate's resume against the job description and calculate a detailed match score.

Respond with valid JSON only. Schema:
{
  "overallScore": number (0-100),
  "skillsMatch": number (0-100),
  "experienceMatch": number (0-100),
  "educationMatch": number (0-100),
  "matchingSkills": ["string"],
  "missingSkills": ["string"],
  "strengths": ["string"],
  "concerns": ["string"],
  "recommendation": "strong_match" | "good_match" | "moderate_match" | "weak_match",
  "summary": "string (2-3 sentence summary)"
}`,
    },
    {
      role: "user",
      content: `## Resume
${resumeText}

## Job Description
${jobDescription}

Analyze the match and return JSON only.`,
    },
  ];
}
