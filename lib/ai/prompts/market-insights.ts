import type { AIMessage } from "../provider";

export function buildMarketAnalysisPrompt(
  role: string,
  location: string,
  skills: string[]
): AIMessage[] {
  return [
    {
      role: "system",
      content: `You are a job market analyst. Analyze the current job market for the specified role, location, and skill set. Provide actionable insights.

Rules:
- Base analysis on general market trends and knowledge
- Provide salary ranges in USD
- Identify in-demand and emerging skills
- Include hiring trend indicators
- Be specific and data-oriented where possible
- If location-specific data is limited, provide general market insights

Respond with valid JSON only. Schema:
{
  "insights": [
    {
      "type": "trend" | "salary" | "skill-demand" | "hiring",
      "title": "string",
      "data": {
        "description": "string",
        "metrics": [{ "label": "string", "value": "string" }],
        "recommendations": ["string"]
      }
    }
  ],
  "summary": "string"
}`,
    },
    {
      role: "user",
      content: `## Market Analysis Request

**Target Role:** ${role}
**Location:** ${location || "Remote / Global"}
**Current Skills:** ${skills.join(", ") || "Not specified"}

---

Analyze the job market for this role and provide insights. Return JSON only.`,
    },
  ];
}
