/**
 * Resume Tailor Service
 * Uses AI to tailor a resume for a specific job description.
 */

import { getUserAIProvider } from "@/lib/ai/key-manager";
import { buildResumeTailoringPrompt } from "@/lib/ai/prompts";
import { getDefaultResume, resumeToText } from "./resume-service";
import { sanitizeForAI } from "@/lib/utils";

export interface TailoredResumeResult {
  tailoredSummary: string;
  tailoredSkills: string[];
  tailoredHighlights: string[];
  matchScore: number;
  matchExplanation: string;
  keywordsUsed: string[];
}

/**
 * Tailor a resume for a specific job description
 */
export async function tailorResumeForJob(
  userId: string,
  jobDescription: string,
  resumeId?: string
): Promise<TailoredResumeResult> {
  const ai = await getUserAIProvider(userId);
  if (!ai) {
    throw new Error("No AI API key configured");
  }

  const resume = await getDefaultResume(userId);
  if (!resume) {
    throw new Error("No resume found. Upload a resume in Settings first.");
  }

  const sanitizedDescription = sanitizeForAI(jobDescription);

  const resumeData = {
    summary: resume.summary || "",
    experience: resume.experience.map((e) => ({
      company: e.company,
      title: e.title,
      description: e.description,
      highlights: e.highlights,
    })),
    skills: resume.skills,
    education: resume.education.map((e) => ({
      school: e.school,
      degree: e.degree,
      field: e.field,
    })),
  };

  const messages = buildResumeTailoringPrompt(resumeData, sanitizedDescription);
  const result = await ai.generateJSON<TailoredResumeResult>(messages);

  return result;
}

/**
 * Get match score for a job without full tailoring
 */
export async function getJobMatchScore(
  userId: string,
  jobDescription: string
): Promise<{ score: number; summary: string }> {
  const ai = await getUserAIProvider(userId);
  if (!ai) {
    return { score: 0, summary: "No AI key configured" };
  }

  const resume = await getDefaultResume(userId);
  if (!resume) {
    return { score: 0, summary: "No resume uploaded" };
  }

  const resumeText = resume.rawText || resumeToText(resume);
  const sanitizedDescription = sanitizeForAI(jobDescription);

  const { buildJobMatchScoringPrompt } = await import("@/lib/ai/prompts");
  const messages = buildJobMatchScoringPrompt(resumeText, sanitizedDescription);
  const result = await ai.generateJSON<{
    overallScore: number;
    summary: string;
  }>(messages);

  return { score: result.overallScore, summary: result.summary };
}
