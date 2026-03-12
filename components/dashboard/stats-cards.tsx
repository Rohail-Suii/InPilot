"use client";

import {
  Send,
  TrendingUp,
  FileText,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDashboardData } from "./dashboard-data-provider";

export function StatsCards() {
  const { stats } = useDashboardData();

  const cards = [
    {
      label: "Total Applied",
      value: stats ? String(stats.totalApplied) : "—",
      change: stats ? `+${stats.appliedThisWeek} this week` : "Loading...",
      icon: Send,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Success Rate",
      value: stats ? `${stats.successRate}%` : "—",
      change: stats ? "Response ratio" : "Loading...",
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Posts This Week",
      value: stats ? String(stats.postsThisWeek) : "—",
      change: stats ? "LinkedIn posts" : "Loading...",
      icon: FileText,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Leads Found",
      value: stats ? String(stats.totalLeads) : "—",
      change: stats ? "Scraped leads" : "Loading...",
      icon: Users,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat) => (
        <Card key={stat.label} className="hover:border-white/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-white/40 mt-1">{stat.change}</p>
              </div>
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  stat.bgColor
                )}
              >
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
