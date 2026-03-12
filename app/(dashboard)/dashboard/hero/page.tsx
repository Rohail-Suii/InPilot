import type { Metadata } from "next";
import { HeroClient } from "@/components/hero/hero-client";

export const metadata: Metadata = {
  title: "Become a Hero",
  description: "Build your LinkedIn presence with AI-powered content creation, group engagement, and strategic posting.",
};

export default function HeroPage() {
  return <HeroClient />;
}
