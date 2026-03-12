import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hero API — coming in Module 10" });
}
