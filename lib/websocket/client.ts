/**
 * WebSocket Client Utility for Dashboard
 * React hook that connects to the /dashboard namespace and integrates
 * with Zustand stores for extension status and notifications.
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useExtensionStore, useNotificationStore } from "@/lib/hooks/use-stores";
import { WS_EVENTS, type SseEventType } from "@/lib/websocket/types";

// ─── Connection Hook ───────────────────────────────────

export function useWebSocket() {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const userIdRef = useRef<string | null>(null);

  const { setConnected, setCurrentTask } = useExtensionStore();
  const { addNotification } = useNotificationStore();

  const maxReconnectAttempts = 10;

  // Keep userId ref in sync with session
  useEffect(() => {
    userIdRef.current = session?.user?.id ?? null;
  }, [session?.user?.id]);

  const connectSocket = useCallback(() => {
    const userId = userIdRef.current;
    if (!userId) return;
    if (socketRef.current?.connected) return;

    // Clean up any existing socket
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
    const socket = io(`${wsUrl}/dashboard`, {
      path: "/api/ws",
      transports: ["websocket", "polling"],
      reconnection: false, // We handle reconnection manually
    });

    socket.on("connect", () => {
      console.log("[LinkedBoost Dashboard] Socket.IO connected");
      reconnectAttemptRef.current = 0;
      socket.emit(WS_EVENTS.AUTH, { token: userId });
    });

    socket.on(WS_EVENTS.AUTH_SUCCESS, (data: { extensionConnected?: boolean }) => {
      console.log("[LinkedBoost Dashboard] Authenticated, extensionConnected:", data.extensionConnected);
      if (data.extensionConnected !== undefined) {
        useExtensionStore.getState().setConnected(data.extensionConnected);
      }
    });

    // Register listeners for all event types
    const events: SseEventType[] = [
      "extension:connected",
      "extension:disconnected",
      "task:start",
      "task:progress",
      "task:complete",
      "task:error",
      "job:found",
      "job:applying",
      "job:applied",
      "post:scheduled",
      "post:published",
      "scraper:result",
      "scraper:complete",
      "limit:warning",
      "limit:reached",
      "safety:alert",
    ];

    for (const event of events) {
      socket.on(event, (data: Record<string, unknown>) => {
        const store = useExtensionStore.getState();
        const notifStore = useNotificationStore.getState();

        switch (event) {
          case "extension:connected":
            store.setConnected(true);
            break;
          case "extension:disconnected":
            store.setConnected(false);
            store.setCurrentTask(null);
            break;
          case "task:start":
            store.setCurrentTask(data.label as string || "Running task...");
            break;
          case "task:progress":
            if (data.message) store.setCurrentTask(data.message as string);
            break;
          case "task:complete":
          case "task:error":
            store.setCurrentTask(null);
            break;
          case "limit:warning":
          case "limit:reached":
          case "safety:alert":
            notifStore.addNotification({
              _id: `ws-${Date.now()}`,
              type: event === "safety:alert" ? "safety_warning" : "limit_warning",
              title: data.title as string || event,
              message: data.message as string || "",
              module: data.module as string,
              read: false,
              createdAt: new Date().toISOString(),
            });
            break;
        }
      });
    }

    socket.on("disconnect", () => {
      console.log("[LinkedBoost Dashboard] Socket.IO disconnected");
      if (reconnectAttemptRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 32_000);
        reconnectAttemptRef.current++;
        reconnectTimerRef.current = setTimeout(connectSocket, delay);
      }
    });

    socket.on("connect_error", (err) => {
      console.log("[LinkedBoost Dashboard] Socket.IO connect error:", err.message);
      if (reconnectAttemptRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 32_000);
        reconnectAttemptRef.current++;
        reconnectTimerRef.current = setTimeout(connectSocket, delay);
      }
    });

    socketRef.current = socket;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Connect when session becomes available
  useEffect(() => {
    if (session?.user?.id) {
      connectSocket();
    }

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const sendCommand = useCallback((action: Record<string, unknown>) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("EXECUTE_ACTION", action);
    }
  }, []);

  const startAutomation = useCallback((searchId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("EXECUTE_ACTION", { type: "START_AUTOMATION", searchId });
    }
  }, []);

  const stopAutomation = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("EXECUTE_ACTION", { type: "STOP_AUTOMATION" });
    }
  }, []);

  return {
    isConnected: socketRef.current?.connected ?? false,
    sendCommand,
    startAutomation,
    stopAutomation,
    reconnect: connectSocket,
  };
}
