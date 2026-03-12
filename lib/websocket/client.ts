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

  const { setConnected, setCurrentTask } = useExtensionStore();
  const { addNotification } = useNotificationStore();

  const maxReconnectAttempts = 10;

  const getBackoffDelay = useCallback((attempt: number) => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s (capped at 32s)
    return Math.min(1000 * Math.pow(2, attempt), 32_000);
  }, []);

  const handleEvent = useCallback(
    (event: SseEventType, data: Record<string, unknown>) => {
      switch (event) {
        case "extension:connected":
          setConnected(true);
          break;
        case "extension:disconnected":
          setConnected(false);
          setCurrentTask(null);
          break;
        case "task:start":
          setCurrentTask(data.label as string || "Running task...");
          break;
        case "task:progress":
          if (data.message) setCurrentTask(data.message as string);
          break;
        case "task:complete":
          setCurrentTask(null);
          break;
        case "task:error":
          setCurrentTask(null);
          break;
        case "limit:warning":
        case "limit:reached":
        case "safety:alert":
          addNotification({
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
    },
    [setConnected, setCurrentTask, addNotification]
  );

  const connect = useCallback(() => {
    if (!session?.user?.id) return;
    if (socketRef.current?.connected) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
    const socket = io(`${wsUrl}/dashboard`, {
      path: "/api/ws",
      transports: ["websocket", "polling"],
      reconnection: false, // We handle reconnection manually for exponential backoff
    });

    socket.on("connect", () => {
      reconnectAttemptRef.current = 0;
      socket.emit(WS_EVENTS.AUTH, { token: session.user.id });
    });

    socket.on(WS_EVENTS.AUTH_SUCCESS, (data: { extensionConnected?: boolean }) => {
      if (data.extensionConnected !== undefined) {
        setConnected(data.extensionConnected);
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
        handleEvent(event, data);
      });
    }

    socket.on("disconnect", () => {
      // Attempt reconnection with exponential backoff
      if (reconnectAttemptRef.current < maxReconnectAttempts) {
        const delay = getBackoffDelay(reconnectAttemptRef.current);
        reconnectAttemptRef.current++;
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    });

    socket.on("connect_error", () => {
      if (reconnectAttemptRef.current < maxReconnectAttempts) {
        const delay = getBackoffDelay(reconnectAttemptRef.current);
        reconnectAttemptRef.current++;
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    });

    socketRef.current = socket;
  }, [session?.user?.id, handleEvent, setConnected, getBackoffDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  const sendCommand = useCallback((action: Record<string, unknown>) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("EXECUTE_ACTION", action);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected: socketRef.current?.connected ?? false,
    sendCommand,
    reconnect: connect,
  };
}
