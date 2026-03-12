"use client";

import { useState } from "react";
import {
  Check,
  Circle,
  Key,
  FileText,
  Puzzle,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    title: "Add your AI API key",
    description: "We use your own key — it's free with Gemini or Groq",
    icon: Key,
    href: "/dashboard/settings",
  },
  {
    id: 2,
    title: "Upload your resume",
    description: "Our AI will parse and structure it automatically",
    icon: FileText,
    href: "/dashboard/settings",
  },
  {
    id: 3,
    title: "Install the Chrome extension",
    description: "Required for interacting with LinkedIn",
    icon: Puzzle,
    href: "/dashboard/settings",
  },
  {
    id: 4,
    title: "Configure your preferences",
    description: "Set daily limits, working hours, and speed",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export function GettingStarted() {
  const [isOpen, setIsOpen] = useState(true);
  // All incomplete by default since this is initial state
  const completedSteps = new Set<number>();

  const progress = (completedSteps.size / steps.length) * 100;

  if (completedSteps.size === steps.length) return null;

  return (
    <Card className="border-blue-500/20 bg-linear-to-br from-blue-500/5 to-transparent">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            Getting Started
            <span className="text-sm font-normal text-white/40">
              {completedSteps.size}/{steps.length} completed
            </span>
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-white/40" />
          ) : (
            <ChevronDown className="h-5 w-5 text-white/40" />
          )}
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full rounded-full bg-white/5">
          <div
            className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {steps.map((step) => {
              const isDone = completedSteps.has(step.id);
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-4 py-3 transition-colors",
                    isDone
                      ? "bg-emerald-500/5"
                      : "bg-white/5 hover:bg-white/10 cursor-pointer"
                  )}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <Circle className="h-5 w-5 text-white/20" />
                    )}
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isDone ? "text-emerald-400 line-through" : "text-white"
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
