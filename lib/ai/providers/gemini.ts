import type { AIProvider, AIMessage, AIGenerateOptions } from "../provider";

export class GeminiProvider implements AIProvider {
  name = "gemini";
  private apiKey: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /** Strip API key from error messages to prevent leaking */
  private sanitizeError(message: string): string {
    return message.replace(new RegExp(this.apiKey, "g"), "[REDACTED]").replace(/key=[^&\s]+/g, "key=[REDACTED]");
  }

  async generateText(messages: AIMessage[], options?: AIGenerateOptions): Promise<string> {
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find((m) => m.role === "system");

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 2048,
        topP: options?.topP ?? 0.95,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
    }

    const res = await fetch(
      `${this.baseUrl}/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(this.sanitizeError(`Gemini API error: ${res.status} — ${err}`));
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  async generateJSON<T>(messages: AIMessage[], options?: AIGenerateOptions): Promise<T> {
    // Use Gemini's native JSON mode — guarantees valid JSON output, no retries needed
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find((m) => m.role === "system");

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 8192,
        topP: options?.topP ?? 0.95,
        responseMimeType: "application/json",
      },
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
    }

    const res = await fetch(
      `${this.baseUrl}/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(this.sanitizeError(`Gemini API error: ${res.status} — ${err}`));
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    try {
      return JSON.parse(text) as T;
    } catch (err) {
      throw new Error(
        `Gemini JSON parse error: ${(err as Error).message}\nResponse preview: ${text.substring(0, 300)}`
      );
    }
  }

  async validateKey(): Promise<boolean> {
    try {
      const res = await fetch(
        `${this.baseUrl}/models?key=${this.apiKey}`
      );
      return res.ok;
    } catch {
      return false;
    }
  }
}
