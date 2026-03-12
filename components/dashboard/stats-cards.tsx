import {
  Send,
  TrendingUp,
  FileText,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Total Applied",
    value: "0",
    change: "+0 this week",
    icon: Send,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    label: "Success Rate",
    value: "0%",
    change: "No data yet",
    icon: TrendingUp,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: "Posts This Week",
    value: "0",
    change: "Start posting!",
    icon: FileText,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    label: "Leads Found",
    value: "0",
    change: "Set up scraper",
    icon: Users,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
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
