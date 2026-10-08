"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { notificationsService, getErrorMessage } from "@/services";
import { cn, timeAgo, initials } from "@/lib/utils";
import type { Notification, User } from "@/types";

export function NotificationBell() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Unread count — har 30 sekundda yangilanadi
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCount = async () => {
      try {
        const { count } = await notificationsService.getUnreadCount();
        setUnreadCount(count);
      } catch {
        // ignore
      }
    };

    fetchCount();
    const timer = setInterval(fetchCount, 30000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  // Tashqariga bosish → yopish
  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  // Dropdown ochilganda xabarnomalarni yuklash
  useEffect(() => {
    if (!open || !isAuthenticated) return;

    (async () => {
      setLoading(true);
      try {
        const res = await notificationsService.getMy({ page: 1, limit: 15 });
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      } catch (err) {
        console.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [open, isAuthenticated]);

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      try {
        await notificationsService.markAsRead(n._id);
        setNotifications((list) =>
          list.map((item) => (item._id === n._id ? { ...item, read: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // ignore
      }
    }

    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((list) => list.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Xabarnomalar"
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300",
          "border-slate-200 bg-white text-slate-700 hover:border-emerald-500/40 hover:text-emerald-600",
          "dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-400",
          "active:scale-95"
        )}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-rose-500/40 ring-2 ring-white dark:ring-zinc-900">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed left-2 right-2 top-20 z-50 max-h-[80vh] overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-2xl shadow-emerald-950/10 backdrop-blur-2xl animate-fade-in-up dark:border-white/10 dark:bg-zinc-900/95 dark:shadow-black/60 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100/80 px-4 py-3 dark:border-white/5">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Xabarnomalar
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {unreadCount > 0 ? `${unreadCount} ta yangi` : "Hammasi o'qilgan"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
              >
                Hammasini o&apos;qish
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-zinc-400">
                Yuklanmoqda...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="text-3xl">🔔</div>
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
                  Xabarnomalar yo&apos;q
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const sender =
                  typeof n.sender === "object" ? (n.sender as User) : null;
                return (
                  <button
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-slate-100/60 px-4 py-3 text-left transition hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/5",
                      !n.read && "bg-emerald-50/40 dark:bg-emerald-500/5"
                    )}
                  >
                    {/* Icon/Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-bold text-white">
                      {sender?.avatarUrl ? (
                        <img
                          src={sender.avatarUrl}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : sender ? (
                        initials(sender.firstName, sender.lastName)
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm",
                          !n.read
                            ? "font-bold text-slate-900 dark:text-white"
                            : "font-medium text-slate-700 dark:text-zinc-300"
                        )}
                      >
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-zinc-400">
                          {n.message}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-slate-400 dark:text-zinc-500">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>

                    {!n.read && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <button
              onClick={() => {
                setOpen(false);
                router.push("/notifications");
              }}
              className="block w-full border-t border-slate-100/80 px-4 py-3 text-center text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-white/5 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
            >
              Barcha xabarnomalarni ko&apos;rish →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
