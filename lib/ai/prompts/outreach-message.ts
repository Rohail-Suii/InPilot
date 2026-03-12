import type { AIMessage } from "../provider";

export function buildOutreachMessagePrompt(
  recipientName: string,
  recipientHeadline: string,
  recipientPostContent: string,
  senderNiche: string,
  senderValue: string
): AIMessage[] {
  return [
    {
      role: "system",
      content: `You are a LinkedIn outreach expert. Generate a personalized, non-spammy connection request message.

Rules:
- Max 300 characters (LinkedIn connection message limit)
- Reference something specific about the person's work or post
- Be genuinely helpful, not salesy
- Mention how you can add value or share common interests
- Natural conversational tone
- No excessive flattery or generic compliments

Respond with valid JSON only. Schema:
{
  "message": "string (max 300 chars)",
  "personalizationPoint": "string (what you referenced)",
  "followUpSuggestion": "string (optional follow-up message for later)"
}`,
    },
    {
      role: "user",
      content: `Write a connection request message:
- Recipient: ${recipientName} (${recipientHeadline})
- Their recent post: "${recipientPostContent.slice(0, 500)}"
- My niche: ${senderNiche}
- Value I offer: ${senderValue}

Keep it under 300 characters. Return JSON only.`,
    },
  ];
}
