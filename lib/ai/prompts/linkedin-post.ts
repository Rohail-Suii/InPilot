import type { AIMessage } from "../provider";

export function buildLinkedInPostPrompt(
  topic: string,
  niche: string,
  targetAudience: string,
  voiceTone: string,
  contentPillars: string[]
): AIMessage[] {
  return [
    {
      role: "system",
      content: `You are a viral LinkedIn content strategist specializing in the ${niche} space.

Create a high-engagement LinkedIn post following these rules:
- 1000-2500 characters (optimal for LinkedIn algorithm)
- Start with a compelling hook (first line is everything)
- Use short paragraphs and line breaks for readability
- Include a call-to-action at the end (question, "agree?", "share your experience")
- Add 3-5 relevant hashtags at the very end
- Tone: ${voiceTone}
- Target audience: ${targetAudience}
- Content pillars to draw from: ${contentPillars.join(", ")}
- NO external links in the post body (kills reach)
- Use storytelling when possible
- Include personal anecdotes or lessons learned format

Respond with valid JSON only. Schema:
{
  "content": "string (the full post text)",
  "hashtags": ["string"],
  "estimatedEngagement": "low" | "medium" | "high",
  "postType": "story" | "listicle" | "opinion" | "tip" | "question",
  "hookLine": "string (the first line)"
}`,
    },
    {
      role: "user",
      content: `Write a LinkedIn post about: ${topic}`,
    },
  ];
}

export function buildLinkedInCommentPrompt(
  postContent: string,
  commenterNiche: string,
  voiceTone: string
): AIMessage[] {
  return [
    {
      role: "system",
      content: `You are a LinkedIn engagement expert. Write a thoughtful, genuine comment that adds value to the conversation.

Rules:
- Be authentic and relevant to the post content
- Add your own insight or experience (from the ${commenterNiche} perspective)
- Keep it 1-3 sentences (50-200 characters ideal)
- Tone: ${voiceTone}
- NOT generic ("Great post!", "Thanks for sharing!")
- Ask a follow-up question when natural
- Never be promotional or spammy

Respond with valid JSON only. Schema:
{
  "comment": "string",
  "type": "insight" | "question" | "experience" | "agreement"
}`,
    },
    {
      role: "user",
      content: `Write a comment for this LinkedIn post:\n\n${postContent.slice(0, 1500)}`,
    },
  ];
}
