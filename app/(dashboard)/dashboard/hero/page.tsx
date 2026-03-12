import type { Metadata } from "next";
import { Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Become a Hero",
  description: "Build your LinkedIn presence with AI-powered content creation, group engagement, and strategic posting.",
};

export default function HeroPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
        <Trophy className="h-8 w-8 text-purple-400" />
      </div>
      <h2 className="text-xl font-semibold text-white">Become a Hero</h2>
      <p className="text-white/40 mt-2 max-w-md">
        Build your LinkedIn presence with AI-powered content creation, group engagement, and strategic posting.
      </p>
    </div>
  );
}
