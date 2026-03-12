import type { Metadata } from "next";
import { JobsClient } from "@/components/jobs/jobs-client";

export const metadata: Metadata = {
  title: "Job Automation",
  description: "Configure your job search, let AI tailor your resume, and auto-apply to LinkedIn Easy Apply jobs.",
};

export default function JobsPage() {
  return <JobsClient />;
}
