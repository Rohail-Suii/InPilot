"use client";

import { useState, useEffect } from "react";
import {
  Send,
  TrendingUp,
  FileText,
  Users,
  BarChart3,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStats {
  totalApplied: number;
  appliedThisWeek: number;
  successRate: number;
  postsThisWeek: number;
  totalLeads: number;
}

interface TodayUsage {
  applies: number;
  posts: number;
  scrapes: number;
  profileViews: number;
  messages: number;
}

interface ActivityItem {
  _id: string;
  action: string;
  module: string;
  status: string;
  timestamp: string;
}

export function AnalyticsClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayUsage, setTodayUsage] = useState<TodayUsage | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
        setTodayUsage(data.todayUsage);
        setRecentActivity(data.recentActivity || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-white/50 mt-1">Loading your performance data...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-white/5" />)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => <div key={i} className="h-64 rounded-xl bg-white/5" />)}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Applied",
      value: stats?.totalApplied || 0,
      change: `+${stats?.appliedThisWeek || 0} this week`,
      icon: Send,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Success Rate",
      value: `${stats?.successRate || 0}%`,
      change: "Response ratio",
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Posts This Week",
      value: stats?.postsThisWeek || 0,
      change: "LinkedIn posts",
      icon: FileText,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Total Leads",
      value: stats?.totalLeads || 0,
      change: "Scraped leads",
      icon: Users,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  ];

  const usageData = todayUsage
    ? [
        { name: "Applications", value: todayUsage.applies, fill: "#3B82F6" },
        { name: "Posts", value: todayUsage.posts, fill: "#8B5CF6" },
        { name: "Scrapes", value: todayUsage.scrapes, fill: "#F59E0B" },
        { name: "Profile Views", value: todayUsage.profileViews, fill: "#10B981" },
        { name: "Messages", value: todayUsage.messages, fill: "#EC4899" },
      ]
    : [];

  // Aggregate activity by module
  const moduleBreakdown = recentActivity.reduce<Record<string, number>>((acc, act) => {
    acc[act.module] = (acc[act.module] || 0) + 1;
    return acc;
  }, {});

  const moduleData = Object.entries(moduleBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  const pieColors = ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#EC4899", "#6366F1"];

  // Activity timeline (group by hour)
  const hourlyActivity = recentActivity.reduce<Record<string, number>>((acc, act) => {
    const hour = new Date(act.timestamp).getHours();
    const label = `${hour.toString().padStart(2, "0")}:00`;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const timelineData = Object.entries(hourlyActivity)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, count]) => ({ time, count }));

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#1a1f35",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px",
      color: "#fff",
      fontSize: "12px",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <p className="text-white/50 mt-1">Track your automation performance and LinkedIn growth</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="hover:border-white/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-1">{stat.change}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-white/50" />
              Today&apos;s Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usageData.every((d) => d.value === 0) ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart3 className="h-8 w-8 text-white/20 mb-3" />
                <p className="text-white/40 text-sm">No activity today</p>
                <p className="text-white/25 text-xs mt-1">Usage will be tracked as you use the automation</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={usageData}>
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {usageData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Module Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-white/50" />
              Activity by Module
            </CardTitle>
          </CardHeader>
          <CardContent>
            {moduleData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-8 w-8 text-white/20 mb-3" />
                <p className="text-white/40 text-sm">No module activity yet</p>
                <p className="text-white/25 text-xs mt-1">Start using features to see breakdown</p>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={moduleData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      strokeWidth={0}
                    >
                      {moduleData.map((_, index) => (
                        <Cell key={index} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {moduleData.map((mod, i) => (
                    <div key={mod.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                        <span className="text-white/60 capitalize">{mod.name}</span>
                      </div>
                      <span className="text-white font-medium">{mod.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-white/50" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TrendingUp className="h-8 w-8 text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No timeline data yet</p>
              <p className="text-white/25 text-xs mt-1">Activity will be charted over time</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="url(#colorActivity)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
