/**
 * WebSocket Server for Extension ↔ Dashboard Communication
 * Uses Socket.IO with namespaces, typed events, message queuing, and heartbeat.
 */

import { Server as SocketIOServer, type Namespace, type Socket } from "socket.io";
import type { Server as HTTPServer } from "http";

// ─── Event Type Definitions ────────────────────────────

export type ExtensionEvent =
  | "extension:connected"
  | "extension:disconnected"
  | "task:start"
  | "task:progress"
  | "task:complete"
  | "task:error"
  | "job:found"
  | "job:applying"
  | "job:applied"
  | "post:scheduled"
  | "post:published"
  | "scraper:result"
  | "scraper:complete"
  | "limit:warning"
  | "limit:reached"
  | "safety:alert";

export interface WSMessage {
  event: ExtensionEvent;
  data: Record<string, unknown>;
  timestamp: number;
}

interface QueuedMessage extends WSMessage {
  userId: string;
}

// ─── State ─────────────────────────────────────────────

let io: SocketIOServer | null = null;
let extensionNs: Namespace | null = null;
let dashboardNs: Namespace | null = null;

const MAX_QUEUED_PER_USER = 100;
const HEARTBEAT_TIMEOUT = 60_000; // 60s — mark disconnected if no heartbeat in this window

// userId -> Set of socket IDs (extension sockets)
const extensionSockets = new Map<string, Set<string>>();

// userId -> Set of socket IDs (dashboard sockets)
const dashboardSockets = new Map<string, Set<string>>();

// userId -> last heartbeat timestamp
const lastHeartbeat = new Map<string, number>();

// userId -> queued messages (delivered when dashboard reconnects)
const messageQueue = new Map<string, QueuedMessage[]>();

// ─── Helpers ───────────────────────────────────────────

function addSocket(map: Map<string, Set<string>>, userId: string, socketId: string) {
  if (!map.has(userId)) {
    map.set(userId, new Set());
  }
  map.get(userId)!.add(socketId);
}

function removeSocket(map: Map<string, Set<string>>, userId: string, socketId: string) {
  const sockets = map.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) {
      map.delete(userId);
    }
  }
}

function queueMessage(userId: string, message: WSMessage) {
  if (!messageQueue.has(userId)) {
    messageQueue.set(userId, []);
  }
  const queue = messageQueue.get(userId)!;
  queue.push({ ...message, userId });
  // Enforce max queue size
  if (queue.length > MAX_QUEUED_PER_USER) {
    queue.shift();
  }
}

function flushQueue(userId: string) {
  const queue = messageQueue.get(userId);
  if (!queue || queue.length === 0) return;

  const sockets = dashboardSockets.get(userId);
  if (!sockets || sockets.size === 0) return;

  for (const msg of queue) {
    for (const sid of sockets) {
      dashboardNs?.to(sid).emit(msg.event, msg.data);
    }
  }
  messageQueue.delete(userId);
}

// ─── Broadcast to Dashboard ────────────────────────────

function broadcastToDashboard(userId: string, event: ExtensionEvent, data: Record<string, unknown>) {
  const sockets = dashboardSockets.get(userId);
  if (!sockets || sockets.size === 0) {
    // Dashboard offline — queue the message
    queueMessage(userId, { event, data, timestamp: Date.now() });
    return;
  }
  for (const sid of sockets) {
    dashboardNs?.to(sid).emit(event, data);
  }
}

// ─── Public API ────────────────────────────────────────

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
    pingInterval: 25_000,
    pingTimeout: 20_000,
  });

  // ── Extension Namespace (/extension) ──
  extensionNs = io.of("/extension");
  extensionNs.on("connection", (socket: Socket) => {
    let userId: string | null = null;

    socket.on("AUTH", (data: { token: string }) => {
      if (!data.token) {
        socket.emit("AUTH_FAILURE", { error: "No token provided" });
        return;
      }

      userId = data.token;
      addSocket(extensionSockets, userId, socket.id);
      lastHeartbeat.set(userId, Date.now());

      socket.emit("AUTH_SUCCESS", { message: "Authenticated" });

      // Notify dashboard that extension connected
      broadcastToDashboard(userId, "extension:connected", { timestamp: Date.now() });
    });

    // Extension reports task/job/post/scraper events
    socket.on("REPORT_STATUS", (data: { event: ExtensionEvent; payload: Record<string, unknown> }) => {
      if (!userId) return;
      broadcastToDashboard(userId, data.event, data.payload);
    });

    socket.on("HEARTBEAT", () => {
      if (userId) {
        lastHeartbeat.set(userId, Date.now());
      }
      socket.emit("HEARTBEAT_ACK", { timestamp: Date.now() });
    });

    socket.on("disconnect", () => {
      if (userId) {
        removeSocket(extensionSockets, userId, socket.id);

        // Only broadcast disconnected if NO extension sockets left for this user
        if (!extensionSockets.has(userId)) {
          broadcastToDashboard(userId, "extension:disconnected", { timestamp: Date.now() });
          lastHeartbeat.delete(userId);
        }
      }
    });
  });

  // ── Dashboard Namespace (/dashboard) ──
  dashboardNs = io.of("/dashboard");
  dashboardNs.on("connection", (socket: Socket) => {
    let userId: string | null = null;

    socket.on("AUTH", (data: { token: string }) => {
      if (!data.token) {
        socket.emit("AUTH_FAILURE", { error: "No token provided" });
        return;
      }

      userId = data.token;
      addSocket(dashboardSockets, userId, socket.id);

      socket.emit("AUTH_SUCCESS", {
        message: "Authenticated",
        extensionConnected: isExtensionConnected(userId),
      });

      // Flush any queued messages
      flushQueue(userId);
    });

    // Dashboard sends commands to extension
    socket.on("EXECUTE_ACTION", (data: Record<string, unknown>) => {
      if (!userId) return;
      sendToExtension(userId, data);
    });

    socket.on("disconnect", () => {
      if (userId) {
        removeSocket(dashboardSockets, userId, socket.id);
      }
    });
  });

  // ── Legacy default namespace (backward compat) ──
  io.on("connection", (socket: Socket) => {
    let authenticatedUserId: string | null = null;

    socket.on("AUTH", (data: { token: string }) => {
      if (!data.token) {
        socket.emit("AUTH_FAILURE", { error: "No token provided" });
        return;
      }

      authenticatedUserId = data.token;
      addSocket(extensionSockets, authenticatedUserId, socket.id);

      socket.emit("AUTH_SUCCESS", { message: "Authenticated" });
    });

    socket.on("REPORT_STATUS", (data) => {
      if (!authenticatedUserId) return;
      broadcastToDashboard(authenticatedUserId, "task:progress", data as Record<string, unknown>);
    });

    socket.on("HEARTBEAT", () => {
      if (authenticatedUserId) {
        lastHeartbeat.set(authenticatedUserId, Date.now());
      }
      socket.emit("HEARTBEAT_ACK", { timestamp: Date.now() });
    });

    socket.on("disconnect", () => {
      if (authenticatedUserId) {
        removeSocket(extensionSockets, authenticatedUserId, socket.id);
      }
    });
  });

  return io;
}

/**
 * Send a command to the extension for a specific user
 */
export function sendToExtension(userId: string, action: Record<string, unknown>): boolean {
  const sockets = extensionSockets.get(userId);
  if (!sockets || sockets.size === 0) return false;

  for (const sid of sockets) {
    extensionNs?.to(sid).emit("EXECUTE_ACTION", action);
  }
  return true;
}

/**
 * Check if a user's extension is connected (with heartbeat freshness check)
 */
export function isExtensionConnected(userId: string): boolean {
  const sockets = extensionSockets.get(userId);
  if (!sockets || sockets.size === 0) return false;

  const lastBeat = lastHeartbeat.get(userId);
  if (lastBeat && Date.now() - lastBeat > HEARTBEAT_TIMEOUT) {
    return false;
  }

  return true;
}

/**
 * Emit a typed event to a user's dashboard
 */
export function emitToDashboard(userId: string, event: ExtensionEvent, data: Record<string, unknown>): void {
  broadcastToDashboard(userId, event, data);
}

/**
 * Get the count of queued messages for a user
 */
export function getQueuedMessageCount(userId: string): number {
  return messageQueue.get(userId)?.length ?? 0;
}

/**
 * Get connection stats (for monitoring)
 */
export function getConnectionStats() {
  return {
    totalExtensionUsers: extensionSockets.size,
    totalDashboardUsers: dashboardSockets.size,
    totalQueuedMessages: Array.from(messageQueue.values()).reduce((sum, q) => sum + q.length, 0),
  };
}
