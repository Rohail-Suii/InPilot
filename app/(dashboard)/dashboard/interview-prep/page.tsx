import type { Metadata } from "next";
import { InterviewPrepClient } from "@/components/interview-prep/interview-prep-client";

export const metadata: Metadata = {
  title: "Interview Prep",
  description: "AI-generated interview questions, company research, and salary insights.",
};

export default function InterviewPrepPage() {
  return <InterviewPrepClient />;
}
