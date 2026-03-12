import type { AIMessage } from "../provider";

export function buildInterviewQuestionsPrompt(
  jobTitle: string,
  company: string,
  jobDescription: string,
  resume?: string
): AIMessage[] {
  return [
    {
      role: "system",
      content: `You are an expert interview coach and career advisor. Generate comprehensive interview preparation questions with suggested answers for the given job position.

Rules:
- Generate 3-4 questions per category (behavioral, technical, situational, company)
- Suggested answers should be detailed and use the STAR method where applicable
- Tailor questions to the specific role and company
- Include questions the candidate is likely to be asked
- Answers should reference specific skills and experiences where possible

Respond with valid JSON only. Schema:
{
  "questions": [
    {
      "question": "string",
      "suggestedAnswer": "string",
      "category": "behavioral" | "technical" | "situational" | "company"
    }
  ]
}`,
    },
    {
      role: "user",
      content: `## Interview Preparation

**Job Title:** ${jobTitle}
**Company:** ${company}

**Job Description:**
${jobDescription}

${resume ? `**Candidate Resume:**\n${resume}` : ""}

---

Generate interview questions with suggested answers. Return JSON only.`,
    },
  ];
}

export function buildCompanyResearchPrompt(
  companyName: string,
  industry: string
): AIMessage[] {
  return [
    {
      role: "system",
      content: `You are a company research analyst. Provide a comprehensive overview of the specified company to help a job candidate prepare for an interview.

Rules:
- Provide factual, verifiable information
- Include company culture insights
- List recent news or developments if known
- Identify main competitors
- Include salary range estimates if possible
- If you don't have specific information, provide general industry context

Respond with valid JSON only. Schema:
{
  "companyResearch": {
    "overview": "string",
    "culture": "string",
    "recentNews": ["string"],
    "competitors": ["string"]
  },
  "salaryInsights": {
    "min": number,
    "max": number,
    "median": number,
    "source": "string"
  }
}`,
    },
    {
      role: "user",
      content: `**Company:** ${companyName}
**Industry:** ${industry}

Research this company and provide insights. Return JSON only.`,
    },
  ];
}
