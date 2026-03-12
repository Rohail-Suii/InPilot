import type { Metadata } from "next";
import { Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Job Automation",
  description: "Configure your job search, let AI tailor your resume, and auto-apply to LinkedIn Easy Apply jobs.",
};

export default function JobsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
        <Briefcase className="h-8 w-8 text-blue-400" />
      </div>
      <h2 className="text-xl font-semibold text-white">Job Automation</h2>
      <p className="text-white/40 mt-2 max-w-md">
        Configure your job search, let AI tailor your resume, and auto-apply to LinkedIn Easy Apply jobs.
      </p>
    </div>
  );
}
