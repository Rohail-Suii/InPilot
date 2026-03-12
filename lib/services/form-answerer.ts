/**
 * Form Answerer Service
 * Answers job application form questions using AI + predefined answers.
 */

import { getUserAIProvider } from "@/lib/ai/key-manager";
import { buildFormAnswerPrompt } from "@/lib/ai/prompts";
import { getDefaultResume, resumeToText } from "./resume-service";

/** Common questions with standard answers */
const COMMON_ANSWERS: Record<string, (prefs: Record<string, string>) => string> = {
  "are you authorized to work": (prefs) => prefs.workAuthorization || "Yes",
  "do you require visa sponsorship": (prefs) => prefs.visaSponsorship || "No",
  "do you require sponsorship": (prefs) => prefs.visaSponsorship || "No",
  "willing to relocate": (prefs) => prefs.willingToRelocate || "Yes",
  "what is your expected salary": (prefs) => prefs.expectedSalary || "",
  "desired salary": (prefs) => prefs.expectedSalary || "",
  "salary expectations": (prefs) => prefs.expectedSalary || "",
  "how did you hear about": () => "LinkedIn",
  "start date": (prefs) => prefs.startDate || "Immediately",
  "notice period": (prefs) => prefs.noticePeriod || "2 weeks",
  "are you 18 years or older": () => "Yes",
  "are you at least 18": () => "Yes",
  "do you have a valid driver": (prefs) => prefs.driversLicense || "Yes",
  "gender": (prefs) => prefs.gender || "Prefer not to say",
  "race": () => "Prefer not to say",
  "ethnicity": () => "Prefer not to say",
  "veteran": (prefs) => prefs.veteranStatus || "No",
  "disability": (prefs) => prefs.disabilityStatus || "Prefer not to say",
};

export interface FormAnswer {
  answer: string;
  confidence: number;
  source: "predefined" | "ai" | "fallback";
}

/**
 * Answer a single form question
 */
export async function answerFormQuestion(
  userId: string,
  question: string,
  userPreferences: Record<string, string> = {}
): Promise<FormAnswer> {
  const questionLower = question.toLowerCase().trim();

  // Check predefined answers first
  for (const [pattern, answerer] of Object.entries(COMMON_ANSWERS)) {
    if (questionLower.includes(pattern)) {
      const answer = answerer(userPreferences);
      if (answer) {
        return { answer, confidence: 95, source: "predefined" };
      }
    }
  }

  // Fall back to AI
  try {
    const ai = await getUserAIProvider(userId);
    if (!ai) {
      return { answer: "", confidence: 0, source: "fallback" };
    }

    const resume = await getDefaultResume(userId);
    const resumeContext = resume ? resumeToText(resume) : "";

    const messages = buildFormAnswerPrompt(question, resumeContext, userPreferences);
    const result = await ai.generateJSON<{ answer: string; confidence: number }>(messages);

    return {
      answer: result.answer || "",
      confidence: result.confidence || 50,
      source: "ai",
    };
  } catch {
    return { answer: "", confidence: 0, source: "fallback" };
  }
}

/**
 * Answer multiple form questions at once
 */
export async function answerFormQuestions(
  userId: string,
  questions: { question: string; fieldType: string }[],
  userPreferences: Record<string, string> = {}
): Promise<{ question: string; fieldType: string; answer: FormAnswer }[]> {
  // Separate predefined and AI-needed questions
  const results: { question: string; fieldType: string; answer: FormAnswer }[] = [];
  const aiNeeded: { index: number; question: string; fieldType: string }[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const questionLower = q.question.toLowerCase().trim();
    let found = false;

    for (const [pattern, answerer] of Object.entries(COMMON_ANSWERS)) {
      if (questionLower.includes(pattern)) {
        const answer = answerer(userPreferences);
        if (answer) {
          results[i] = { ...q, answer: { answer, confidence: 95, source: "predefined" } };
          found = true;
          break;
        }
      }
    }

    if (!found) {
      aiNeeded.push({ index: i, ...q });
    }
  }

  // Process AI questions concurrently (batch of 3)
  if (aiNeeded.length > 0) {
    const CONCURRENCY = 3;
    for (let i = 0; i < aiNeeded.length; i += CONCURRENCY) {
      const batch = aiNeeded.slice(i, i + CONCURRENCY);
      const aiResults = await Promise.allSettled(
        batch.map(item => answerFormQuestion(userId, item.question, userPreferences))
      );

      for (let j = 0; j < batch.length; j++) {
        const item = batch[j];
        const result = aiResults[j];
        results[item.index] = {
          question: item.question,
          fieldType: item.fieldType,
          answer: result.status === "fulfilled"
            ? result.value
            : { answer: "", confidence: 0, source: "fallback" },
        };
      }
    }
  }

  // Return in original order, filling any gaps
  return questions.map((q, i) => results[i] || { ...q, answer: { answer: "", confidence: 0, source: "fallback" as const } });
}
