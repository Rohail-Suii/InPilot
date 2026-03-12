import type { Metadata } from "next";
import { ProfileOptimizerClient } from "@/components/profile-optimizer/profile-optimizer-client";

export const metadata: Metadata = {
  title: "Profile Optimizer",
  description: "AI-powered LinkedIn profile analysis and optimization suggestions.",
};

export default function ProfileOptimizerPage() {
  return <ProfileOptimizerClient />;
}
