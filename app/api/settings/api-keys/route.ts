import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { aiApiKeySchema } from "@/lib/validators";
import { saveApiKey, removeApiKey, getUserApiKeys } from "@/lib/ai/key-manager";
import { checkApiRateLimit } from "@/lib/utils/rate-limit";
import type { AIProviderName } from "@/lib/ai/provider";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await getUserApiKeys(session.user.id);
  return NextResponse.json({ keys });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkApiRateLimit(session.user.id);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = aiApiKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { provider, apiKey } = parsed.data;
  const result = await saveApiKey(session.user.id, provider as AIProviderName, apiKey);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    isValid: result.isValid,
    message: result.isValid ? "API key saved and validated" : "API key saved but validation failed",
  });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider");
  if (!provider || !["gemini", "openai", "anthropic", "groq"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  await removeApiKey(session.user.id, provider as AIProviderName);
  return NextResponse.json({ success: true });
}
