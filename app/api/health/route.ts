import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "unhealthy", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
