import type { Metadata } from "next";
import { MarketInsightsClient } from "@/components/market-insights/market-insights-client";

export const metadata: Metadata = {
  title: "Market Insights",
  description: "AI-powered job market intelligence, salary data, and skill demand analysis.",
};

export default function MarketInsightsPage() {
  return <MarketInsightsClient />;
}
