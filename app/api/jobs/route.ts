import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Jobs API — coming in Module 9" });
}
