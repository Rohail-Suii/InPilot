import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "LinkedBoost",
    template: "%s — LinkedBoost",
  },
  description: "Sign in or create your LinkedBoost account to automate LinkedIn.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0F1C] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
      {children}
    </div>
  );
}
