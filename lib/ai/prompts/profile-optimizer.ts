import type { AIMessage } from "../provider";

export function buildProfileAnalysisPrompt(profileData: {
  headline?: string;
  summary?: string;
  experience?: { title: string; company: string; description: string }[];
  skills?: string[];
  education?: { school: string; degree: string; field: string }[];
}): AIMessage[] {
  return [
    {
      role: "system",
      content: `You are an expert LinkedIn profile optimization consultant. Analyze the provided LinkedIn profile data and score each section on a scale of 0-100.

For each section, provide:
- A score (0-100)
- Specific, actionable suggestions for improvement

Rules:
- Be honest and constructive with feedback
- Focus on what will increase profile visibility and recruiter engagement
- Consider LinkedIn SEO best practices
- Consider industry standards

Respond with valid JSON only. Schema:
{
  "overallScore": number,
  "sections": {
    "headline": { "score": number, "current": "string", "suggestion": "string" },
    "summary": { "score": number, "current": "string", "suggestion": "string" },
    "experience": { "score": number, "suggestions": ["string"] },
    "skills": { "score": number, "missing": ["string"], "suggestions": ["string"] },
    "education": { "score": number }
  },
  "recommendations": ["string"]
}`,
    },
    {
      role: "user",
      content: `## LinkedIn Profile Data

**Headline:** ${profileData.headline || "Not provided"}

**Summary:** ${profileData.summary || "Not provided"}

**Experience:**
${
  profileData.experience?.length
    ? profileData.experience
        .map((exp) => `- ${exp.title} at ${exp.company}\n  ${exp.description}`)
        .join("\n")
    : "Not provided"
}

**Skills:** ${profileData.skills?.join(", ") || "Not provided"}

**Education:**
${
  profileData.education?.length
    ? profileData.education
        .map((edu) => `- ${edu.degree} in ${edu.field} from ${edu.school}`)
        .join("\n")
    : "Not provided"
}

---

Analyze this LinkedIn profile and provide scores and suggestions. Return JSON only.`,
    },
  ];
}

export function buildHeadlineOptimizerPrompt(
  currentHeadline: string,
  industry: string,
  skills: string[]
): AIMessage[] {
  return [
    {
      role: "system",
      content: `You are a LinkedIn headline optimization expert. Generate 5 compelling, SEO-optimized LinkedIn headlines based on the user's current headline, industry, and skills.

Rules:
- Each headline should be under 220 characters
- Include relevant keywords for LinkedIn search
- Mix professional value propositions with personality
- Use power words and industry-specific terms
- Avoid generic terms like "passionate" or "hardworking"

Respond with valid JSON only. Schema:
{
  "headlines": [
    { "text": "string", "reasoning": "string" }
  ]
}`,
    },
    {
      role: "user",
      content: `**Current Headline:** ${currentHeadline}
**Industry:** ${industry}
**Key Skills:** ${skills.join(", ")}

Generate 5 optimized headline alternatives. Return JSON only.`,
    },
  ];
}

export function buildSummaryOptimizerPrompt(
  currentSummary: string,
  experience: string,
  targetRole: string
): AIMessage[] {
  return [
    {
      role: "system",
      content: `You are a LinkedIn summary writing expert. Write an optimized LinkedIn summary (About section) that will engage recruiters and showcase the professional's value.

Rules:
- Start with a compelling hook in the first line
- Keep it between 200-400 words
- Include relevant keywords naturally
- Show personality while remaining professional
- Include a clear call to action at the end
- Use short paragraphs for readability
- Highlight achievements and impact, not just responsibilities

Respond with valid JSON only. Schema:
{
  "summary": "string",
  "keyChanges": ["string"],
  "keywordsUsed": ["string"]
}`,
    },
    {
      role: "user",
      content: `**Current Summary:** ${currentSummary || "No summary provided"}

**Experience Overview:** ${experience}

**Target Role:** ${targetRole}

Write an optimized LinkedIn summary. Return JSON only.`,
    },
  ];
}
