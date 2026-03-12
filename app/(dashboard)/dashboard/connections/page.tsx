import type { Metadata } from "next";
import { ConnectionsClient } from "@/components/connections/connections-client";

export const metadata: Metadata = {
  title: "Connection Manager",
  description: "Manage your LinkedIn connection requests and track acceptance rates.",
};

export default function ConnectionsPage() {
  return <ConnectionsClient />;
}
