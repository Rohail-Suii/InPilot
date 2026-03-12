"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Briefcase,
  Trophy,
  Database,
  AlertTriangle,
  Info,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/lib/hooks/use-stores";
import { Button } from "@/components/ui/button";

const moduleIcons: Record<string, typeof Briefcase> = {
  jobs: Briefcase,
  hero: Trophy,
  scraper: Database,
  system: Info,
};

const typeColors: Record<string, string> = {
  application_submitted: "text-emerald-400",
  application_failed: "text-red-400",
  post_published: "text-purple-400",
  post_scheduled: "text-blue-400",
  lead_found: "text-amber-400",
  limit_warning: "text-amber-400",
  limit_reached: "text-red-400",
  extension_disconnected: "text-red-400",
  safety_alert: "text-red-400",
  error: "text-red-400",
  info: "text-blue-400",
};

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isOpen,
    setNotifications,
    setUnreadCount,
    setOpen,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } finally {
      setLoading(false);
    }
  }, [setNotifications, setUnreadCount]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds for new notifications
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [isOpen, setOpen]);

  const handleMarkAsRead = async (id: string) => {
    const prev = [...notifications];
    const prevCount = unreadCount;
    markAsRead(id);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setNotifications(prev);
      setUnreadCount(prevCount);
    }
  };

  const handleMarkAllRead = async () => {
    const prev = [...notifications];
    const prevCount = unreadCount;
    markAllAsRead();
    try {
      const res = await fetch("/api/notifications?action=read-all", { method: "PATCH" });
      if (!res.ok) throw new Error();
    } catch {
      setNotifications(prev);
      setUnreadCount(prevCount);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = [...notifications];
    const prevCount = unreadCount;
    removeNotification(id);
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setNotifications(prev);
      setUnreadCount(prevCount);
    }
  };

  const handleClearAll = async () => {
    const prev = [...notifications];
    const prevCount = unreadCount;
    setNotifications([]);
    setUnreadCount(0);
    try {
      const res = await fetch("/api/notifications?id=all", { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setNotifications(prev);
      setUnreadCount(prevCount);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="h-5 w-5 text-white/50" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[min(380px,calc(100vw-2rem))] max-h-[480px] overflow-hidden rounded-xl bg-[#0F1425] border border-white/10 shadow-2xl shadow-black/50 z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="text-xs text-white/40 hover:text-white/70 h-7 px-2"
                  >
                    <CheckCheck className="h-3.5 w-3.5 mr-1" />
                    Read all
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs text-white/40 hover:text-red-400 h-7 px-2"
                    aria-label="Clear all notifications"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[400px]">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 text-white/30 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-8 w-8 text-white/15 mb-2" />
                  <p className="text-sm text-white/30">No notifications</p>
                  <p className="text-xs text-white/20 mt-0.5">
                    You&apos;re all caught up
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => {
                    const ModuleIcon =
                      moduleIcons[notification.module || "system"] || Info;
                    const colorClass =
                      typeColors[notification.type] || "text-white/50";

                    return (
                      <div
                        key={notification._id}
                        className={cn(
                          "group flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer",
                          !notification.read && "bg-blue-500/5"
                        )}
                        onClick={() => {
                          if (!notification.read)
                            handleMarkAsRead(notification._id);
                        }}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
                            notification.type.includes("alert") ||
                              notification.type.includes("failed") ||
                              notification.type.includes("error")
                              ? "bg-red-500/10"
                              : notification.type.includes("warning") ||
                                notification.type.includes("limit")
                              ? "bg-amber-500/10"
                              : "bg-blue-500/10"
                          )}
                        >
                          <ModuleIcon className={cn("h-4 w-4", colorClass)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm leading-tight",
                                notification.read
                                  ? "text-white/60"
                                  : "text-white font-medium"
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-white/40 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-white/25 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification._id);
                          }}
                          className="opacity-0 group-hover:opacity-100 shrink-0 text-white/30 hover:text-red-400 transition-all mt-0.5"
                          aria-label="Delete notification"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
