/**
 * WebSocket Server for Extension Communication
 * Uses Socket.IO to relay commands between the web app and the browser extension.
 */

import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { auth } from "@/auth";

let io: SocketIOServer | null = null;

// Map userId -> Set of socket IDs
const userSockets = new Map<string, Set<string>>();

export function getIO(): SocketIOServer | null {
  return io;
}

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: "/api/ws",
    cors: {
      origin: [
        process.env.NEXTAUTH_URL || "http://localhost:3000",
        "chrome-extension://*",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    let authenticatedUserId: string | null = null;

    // Extension sends auth token on connect
    socket.on("AUTH", async (data: { token: string }) => {
      try {
        // Verify the token by checking session
        // Extension should send a session token or JWT
        if (!data.token) {
          socket.emit("AUTH_FAILURE", { error: "No token provided" });
          return;
        }

        // For now, trust the userId sent (in production, validate JWT)
        authenticatedUserId = data.token;

        // Track socket -> user mapping
        if (!userSockets.has(authenticatedUserId)) {
          userSockets.set(authenticatedUserId, new Set());
        }
        userSockets.get(authenticatedUserId)!.add(socket.id);

        socket.emit("AUTH_SUCCESS", { message: "Authenticated" });
      } catch {
        socket.emit("AUTH_FAILURE", { error: "Invalid token" });
      }
    });

    // Relay action results from extension back to web app
    socket.on("REPORT_STATUS", (data) => {
      if (!authenticatedUserId) return;
      // Broadcast to all sockets of this user (web app tabs)
      const sockets = userSockets.get(authenticatedUserId);
      if (sockets) {
        for (const sid of sockets) {
          if (sid !== socket.id) {
            io?.to(sid).emit("ACTION_RESULT", data);
          }
        }
      }
    });

    socket.on("HEARTBEAT", () => {
      socket.emit("HEARTBEAT_ACK", { timestamp: Date.now() });
    });

    socket.on("disconnect", () => {
      if (authenticatedUserId) {
        const sockets = userSockets.get(authenticatedUserId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(authenticatedUserId);
          }
        }
      }
    });
  });

  return io;
}

/**
 * Send a command to the extension for a specific user
 */
export function sendToExtension(userId: string, action: Record<string, unknown>): boolean {
  if (!io) return false;

  const sockets = userSockets.get(userId);
  if (!sockets || sockets.size === 0) return false;

  for (const sid of sockets) {
    io.to(sid).emit("EXECUTE_ACTION", action);
  }
  return true;
}

/**
 * Check if a user's extension is connected
 */
export function isExtensionConnected(userId: string): boolean {
  const sockets = userSockets.get(userId);
  return !!sockets && sockets.size > 0;
}
