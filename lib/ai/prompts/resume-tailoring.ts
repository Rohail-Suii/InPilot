import type { AIMessage } from "../provider";

export function buildResumeTailoringPrompt(
  resumeData: {
    summary: string;
    experience: { company: string; title: string; description: string; highlights: string[] }[];
    skills: string[];
    education: { school: string; degree: string; field: string }[];
  },
  jobDescription: string
): AIMessage[] {
  return [
    {
      role: "system",
      content: `You are an expert resume tailor and ATS optimization specialist. Given a resume and job description, produce a tailored version that maximizes the match score.

Rules:
- Rewrite the summary to directly address the job requirements
- Reorder and emphasize skills that match the job description
- Modify experience highlights to use keywords from the job posting
- Keep all facts truthful — only rephrase, never fabricate experience
- Calculate a match score (0-100) with brief explanation

Respond with valid JSON only. Schema:
{
  "tailoredSummary": "string",
  "tailoredSkills": ["string"],
  "tailoredHighlights": ["string"],
  "matchScore": number,
  "matchExplanation": "string",
  "keywordsUsed": ["string"]
}`,
    },
    {
      role: "user",
      content: `## Current Resume

**Summary:** ${resumeData.summary}

**Skills:** ${resumeData.skills.join(", ")}

**Experience:**
${resumeData.experience
  .map(
    (exp) =>
      `- ${exp.title} at ${exp.company}\n  ${exp.description}\n  Highlights: ${exp.highlights.join("; ")}`
  )
  .join("\n")}

**Education:**
${resumeData.education.map((edu) => `- ${edu.degree} in ${edu.field} from ${edu.school}`).join("\n")}

---

## Job Description

${jobDescription}

---

Tailor my resume for this job. Return JSON only.`,
    },
  ];
}
