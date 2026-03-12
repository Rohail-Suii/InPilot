"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  TrendingUp,
  Sparkles,
  RefreshCw,
  DollarSign,
  Zap,
  Users,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InsightMetric {
  label: string;
  value: string;
}

interface InsightData {
  description: string;
  metrics?: InsightMetric[];
  recommendations?: string[];
}

interface MarketInsight {
  _id: string;
  type: "trend" | "salary" | "skill-demand" | "hiring";
  title: string;
  data: InsightData;
  period: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MarketInsightsClient() {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState("");

  // Form state
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/market-insights");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInsights(data.insights || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleGenerate = async () => {
    if (!role) {
      toast.error("Please enter a target role");
      return;
    }
    try {
      setGenerating(true);
      const res = await fetch("/api/market-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          location,
          skills: skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInsights(data.insights || []);
      setSummary(data.summary || "");
      toast.success("Market insights generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate insights");
    } finally {
      setGenerating(false);
    }
  };

  const typeIcons: Record<string, React.ReactNode> = {
    trend: <TrendingUp className="h-5 w-5 text-blue-400" />,
    salary: <DollarSign className="h-5 w-5 text-emerald-400" />,
    "skill-demand": <Zap className="h-5 w-5 text-amber-400" />,
    hiring: <Users className="h-5 w-5 text-purple-400" />,
  };

  const typeBadgeVariant: Record<string, "info" | "success" | "warning" | "default"> = {
    trend: "info",
    salary: "success",
    "skill-demand": "warning",
    hiring: "default",
  };

  const trendInsights = insights.filter((i) => i.type === "trend");
  const salaryInsights = insights.filter((i) => i.type === "salary");
  const skillInsights = insights.filter((i) => i.type === "skill-demand");
  const hiringInsights = insights.filter((i) => i.type === "hiring");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Insights</h1>
          <p className="text-white/50 mt-1">
            AI-powered job market intelligence and trends
          </p>
        </div>
        <Button onClick={fetchInsights} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Generate Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Generate Market Analysis
          </CardTitle>
          <CardDescription>
            Get AI-powered insights about the job market for your target role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="role">Target Role *</Label>
              <Input
                id="role"
                placeholder="e.g., Full Stack Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="React, Node.js, Python..."
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generating || !role} className="w-full">
            {generating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {generating ? "Analyzing Market..." : "Generate Insights"}
          </Button>
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-white/70">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 ? (
        <div className="space-y-6">
          {/* Trend Insights */}
          {trendInsights.length > 0 && (
            <div>
              <h3 className="text-white font-medium flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Market Trends
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendInsights.map((insight) => (
                  <InsightCard key={insight._id} insight={insight} icon={typeIcons[insight.type]} badgeVariant={typeBadgeVariant[insight.type]} />
                ))}
              </div>
            </div>
          )}

          {/* Salary Insights */}
          {salaryInsights.length > 0 && (
            <div>
              <h3 className="text-white font-medium flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Salary Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {salaryInsights.map((insight) => (
                  <InsightCard key={insight._id} insight={insight} icon={typeIcons[insight.type]} badgeVariant={typeBadgeVariant[insight.type]} />
                ))}
              </div>
            </div>
          )}

          {/* Skill Demand */}
          {skillInsights.length > 0 && (
            <div>
              <h3 className="text-white font-medium flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-amber-400" />
                Skills in Demand
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillInsights.map((insight) => (
                  <InsightCard key={insight._id} insight={insight} icon={typeIcons[insight.type]} badgeVariant={typeBadgeVariant[insight.type]} />
                ))}
              </div>
            </div>
          )}

          {/* Hiring Trends */}
          {hiringInsights.length > 0 && (
            <div>
              <h3 className="text-white font-medium flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-purple-400" />
                Hiring Activity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hiringInsights.map((insight) => (
                  <InsightCard key={insight._id} insight={insight} icon={typeIcons[insight.type]} badgeVariant={typeBadgeVariant[insight.type]} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="h-16 w-16 text-white/20 mb-4" />
            <h3 className="text-white font-medium text-lg mb-2">No Market Insights Yet</h3>
            <p className="text-white/50 text-center max-w-md">
              Enter your target role above and generate AI-powered market intelligence including salary data, skill demand, and hiring trends.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Insight Card Sub-Component
// ---------------------------------------------------------------------------

function InsightCard({
  insight,
  icon,
  badgeVariant,
}: {
  insight: MarketInsight;
  icon: React.ReactNode;
  badgeVariant: "info" | "success" | "warning" | "default";
}) {
  const data = insight.data as InsightData;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="shrink-0 mt-0.5">{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-medium text-sm truncate">{insight.title}</h4>
              <Badge variant={badgeVariant} className="shrink-0">
                {insight.type}
              </Badge>
            </div>
            <p className="text-xs text-white/40">{insight.period}</p>
          </div>
        </div>

        {data.description && (
          <p className="text-sm text-white/60 mb-3">{data.description}</p>
        )}

        {data.metrics && data.metrics.length > 0 && (
          <div className="space-y-2 mb-3">
            {data.metrics.map((metric, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-white/50">{metric.label}</span>
                <span className="text-white font-medium flex items-center gap-1">
                  {metric.value.includes("+") ? (
                    <ArrowUp className="h-3 w-3 text-emerald-400" />
                  ) : metric.value.includes("-") ? (
                    <ArrowDown className="h-3 w-3 text-red-400" />
                  ) : (
                    <Minus className="h-3 w-3 text-white/30" />
                  )}
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {data.recommendations && data.recommendations.length > 0 && (
          <div className="border-t border-white/5 pt-2 mt-2">
            <p className="text-xs text-white/40 mb-1">Recommendations</p>
            <ul className="space-y-1">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="text-xs text-white/50 flex items-start gap-1">
                  <span className="text-blue-400 mt-0.5">-</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
