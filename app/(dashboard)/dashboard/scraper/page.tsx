import type { Metadata } from "next";
import { Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Data Scraper",
  description: "Scrape LinkedIn for leads, find posts needing your services, and automate personalized outreach.",
};

export default function ScraperPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
        <Database className="h-8 w-8 text-amber-400" />
      </div>
      <h2 className="text-xl font-semibold text-white">Data Scraper</h2>
      <p className="text-white/40 mt-2 max-w-md">
        Scrape LinkedIn for leads, find posts needing your services, and automate personalized outreach.
      </p>
    </div>
  );
}
