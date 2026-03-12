import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export function RecentActivity() {
  // Will be populated from DB in later modules
  const activities: { action: string; module: string; time: string; status: string }[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-white/50" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">No activity yet</p>
            <p className="text-white/25 text-xs mt-1">
              Your automation activity will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={activity.status === "success" ? "success" : "error"}>
                    {activity.status}
                  </Badge>
                  <span className="text-sm text-white">{activity.action}</span>
                </div>
                <span className="text-xs text-white/40">{activity.time}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
