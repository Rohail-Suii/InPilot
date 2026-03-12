import type { AIMessage } from "../provider";

export function buildFormAnswerPrompt(
  question: string,
  resumeContext: string,
  userPreferences?: Record<string, string>
): AIMessage[] {
  const prefsText = userPreferences
    ? Object.entries(userPreferences)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n")
    : "None provided";

  return [
    {
      role: "system",
      content: `You are a job application form assistant. Answer application questions accurately and professionally based on the candidate's resume and preferences.

Rules:
- Be concise and direct
- Match the expected format (yes/no, number, short text)
- For salary questions, give a reasonable range based on context
- For years of experience, calculate from resume dates
- Never fabricate information not supported by the resume
- If you cannot determine an answer, respond with a reasonable professional default

Respond with valid JSON only. Schema:
{
  "answer": "string",
  "confidence": number (0-100),
  "reasoning": "string (brief explanation)"
}`,
    },
    {
      role: "user",
      content: `## Question
"${question}"

## Candidate Resume Context
${resumeContext}

## User Preferences
${prefsText}

Answer this application question. Return JSON only.`,
    },
  ];
}
