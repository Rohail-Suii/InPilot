"use client";

import Link from "next/link";
import { Briefcase, Trophy, Database, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Job Automation",
    description: "Auto-apply to LinkedIn Easy Apply jobs with AI-tailored resumes",
    href: "/dashboard/jobs",
    icon: Briefcase,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "hover:border-blue-500/30",
  },
  {
    title: "Become a Hero",
    description: "Build your LinkedIn brand with AI-generated content & engagement",
    href: "/dashboard/hero",
    icon: Trophy,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "hover:border-purple-500/30",
  },
  {
    title: "Data Scraper",
    description: "Find leads, scrape posts, and automate personalized outreach",
    href: "/dashboard/scraper",
    icon: Database,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "hover:border-amber-500/30",
  },
];

export function QuickStartCards() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Quick Start</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card
              className={cn(
                "group cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                feature.borderColor
              )}
            >
              <CardContent className="p-6">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg mb-4",
                    feature.bgColor
                  )}
                >
                  <feature.icon className={cn("h-5 w-5", feature.color)} />
                </div>
                <h4 className="text-base font-semibold text-white mb-1">
                  {feature.title}
                </h4>
                <p className="text-sm text-white/40 mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center gap-1 text-sm font-medium text-blue-400 group-hover:gap-2 transition-all">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
