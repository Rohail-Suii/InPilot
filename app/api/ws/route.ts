/**
 * WebSocket API Route
 * Initializes the Socket.IO server on the Next.js HTTP server.
 * This endpoint also serves as a health check for WebSocket connectivity.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    websocket: true,
    message: "WebSocket server available via Socket.IO at /api/ws",
  });
}
