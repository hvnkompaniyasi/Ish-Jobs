"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks";
import { notificationsService, getErrorMessage } from "@/services";
import { cn, timeAgo, initials } from "@/lib/utils";
import type { Notification, User } from "@/types";

type FilterTab = "all" | "unread";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { hydrated, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?next=/notifications");
    }
  }, [hydrated, isAuthenticated, router]);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const res = await notificationsService.getMy({ page, limit: 20 });
      const filtered =
        tab === "unread"
          ? res.notifications.filter((n) => !n.read)
          : res.notifications;
      setNotifications(filtered);
      setPagination(res.pagination);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, tab, isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      try {
        await notificationsService.markAsRead(n._id);
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // ignore
      }
    }
    if (n.link) router.push(n.link);
    else load();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setUnreadCount(0);
      load();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleting(id);
    try {
      await notificationsService.delete(id);
      setNotifications((list) => list.filter((n) => n._id !== id));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  const goToPage = (p: number) => {
    setPage(p);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!hydrated) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Xabarnomalar
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              {unreadCount > 0
                ? `${unreadCount} ta o'qilmagan`
                : "Hammasi o'qilgan"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Hammasini o&apos;qish
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-white/60 bg-white/40 p-1.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <button
            type="button"
            onClick={() => { setTab("all"); setPage(1); }}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200",
              tab === "all"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 dark:bg-emerald-500"
                : "text-slate-600 hover:bg-white/60 dark:text-zinc-400 dark:hover:bg-white/5"
            )}
          >
            Hammasi
          </button>
          <button
            type="button"
            onClick={() => { setTab("unread"); setPage(1); }}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200",
              tab === "unread"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 dark:bg-emerald-500"
                : "text-slate-600 hover:bg-white/60 dark:text-zinc-400 dark:hover:bg-white/5"
            )}
          >
            O&apos;qilmagan {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {error && !loading && (
        <div className="rim rounded-3xl glass p-6 text-center">
          <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="rim rounded-3xl glass p-12 text-center">
          <div className="text-5xl">🔔</div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            {tab === "unread" ? "O'qilmagan xabarnomalar yo'q" : "Xabarnomalar yo'q"}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Yangi xabarlar bu yerda paydo bo&apos;ladi
          </p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <>
          <div className="rim overflow-hidden rounded-3xl glass">
            {notifications.map((n, i) => {
              const sender = typeof n.sender === "object" ? (n.sender as User) : null;
              return (
                <div
                  key={n._id}
                  onClick={() => handleClick(n)}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "group flex cursor-pointer items-start gap-3 border-b border-slate-100/60 px-4 py-4 transition hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/5 sm:px-5",
                    i === notifications.length - 1 && "border-b-0",
                    !n.read && "bg-emerald-50/40 dark:bg-emerald-500/5"
                  )}
                >
                  {/* Avatar / Icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-black text-white shadow-lg shadow-emerald-500/20 ring-2 ring-white/40 dark:ring-white/10">
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

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          !n.read
                            ? "font-bold text-slate-900 dark:text-white"
                            : "font-medium text-slate-700 dark:text-zinc-300"
                        )}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
                      )}
                    </div>

                    {n.message && (
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                        {n.message}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                        {timeAgo(n.createdAt)}
                      </span>

                      <button
                        onClick={(e) => handleDelete(e, n._id)}
                        disabled={deleting === n._id}
                        className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 disabled:opacity-30"
                        aria-label="O'chirish"
                      >
                        {deleting === n._id ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                ← Oldingi
              </Button>
              <span className="px-3 text-sm font-medium text-slate-600 dark:text-zinc-400">
                {pagination.page} / {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                Keyingi →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
