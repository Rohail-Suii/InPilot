import type { Metadata } from "next";
import { ScraperClient } from "@/components/scraper/scraper-client";

export const metadata: Metadata = {
  title: "Data Scraper",
  description: "Scrape LinkedIn for leads, find posts needing your services, and automate personalized outreach.",
};

export default function ScraperPage() {
  return <ScraperClient />;
}
