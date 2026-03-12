import type { Metadata } from "next";
import { Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your profile, API keys, resume, automation preferences, and extension settings.",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Settings className="h-8 w-8 text-white/40" />
      </div>
      <h2 className="text-xl font-semibold text-white">Settings</h2>
      <p className="text-white/40 mt-2 max-w-md">
        Manage your profile, API keys, resume, automation preferences, and extension settings.
      </p>
    </div>
  );
}
