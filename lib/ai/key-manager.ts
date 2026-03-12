import type { AIProvider, AIProviderName } from "./provider";
import { GeminiProvider } from "./providers/gemini";
import { GroqProvider } from "./providers/groq";
import { OpenAIProvider } from "./providers/openai";
import { encrypt, decrypt } from "@/lib/utils/encryption";
import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/user";

export function createAIProvider(provider: AIProviderName, apiKey: string): AIProvider | null {
  switch (provider) {
    case "gemini":
      return new GeminiProvider(apiKey);
    case "groq":
      return new GroqProvider(apiKey);
    case "openai":
      return new OpenAIProvider(apiKey);
    case "anthropic":
      return null; // Not yet implemented
    default:
      return null;
  }
}

export async function saveApiKey(userId: string, provider: AIProviderName, apiKey: string) {
  await connectDB();
  const encryptedKey = encrypt(apiKey);
  const ai = createAIProvider(provider, apiKey);

  if (!ai) {
    return { isValid: false, error: `${provider} provider is not yet supported` };
  }

  const isValid = await ai.validateKey();

  await User.updateOne(
    { _id: userId },
    {
      $pull: { aiApiKeys: { provider } },
    }
  );

  await User.updateOne(
    { _id: userId },
    {
      $push: { aiApiKeys: { provider, encryptedKey, isValid } },
    }
  );

  return { isValid };
}

export async function removeApiKey(userId: string, provider: AIProviderName) {
  await connectDB();
  await User.updateOne({ _id: userId }, { $pull: { aiApiKeys: { provider } } });
}

export async function getUserAIProvider(userId: string): Promise<AIProvider | null> {
  await connectDB();
  const user = await User.findById(userId).lean();
  if (!user?.aiApiKeys?.length) return null;

  const validKey = user.aiApiKeys.find((k) => k.isValid);
  if (!validKey) return null;

  const decryptedKey = decrypt(validKey.encryptedKey);
  const provider = createAIProvider(validKey.provider as AIProviderName, decryptedKey);
  return provider;
}

export async function getUserApiKeys(userId: string) {
  await connectDB();
  const user = await User.findById(userId).lean();
  return (user?.aiApiKeys ?? []).map((k) => ({
    provider: k.provider,
    isValid: k.isValid,
    // Never return the actual key
    maskedKey: "••••" + decrypt(k.encryptedKey).slice(-4),
  }));
}
