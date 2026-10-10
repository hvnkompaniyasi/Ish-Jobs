"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks";
import { notificationsService } from "@/services";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const isEmployer =
    isAuthenticated &&
    (user?.activeRole === "employer" || user?.role === "employer");

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCount = async () => {
      try {
        const { count } = await notificationsService.getUnreadCount();
        setUnreadCount(count);
      } catch {}
    };
    fetchCount();
    const timer = setInterval(fetchCount, 30000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const items = [
    {
      href: "/",
      label: "Bosh",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
      ),
    },
    {
      href: "/jobs/map",
      label: "Xarita",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      href: "/jobs",
      label: "Ish",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      href: "/notifications",
      label: "Xabar",
      badge: unreadCount > 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      ),
    },
    {
      href: isAuthenticated ? (isEmployer ? "/dashboard" : "/profile") : "/login",
      label: isAuthenticated ? (isEmployer ? "Panel" : "Profil") : "Kirish",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    // OUTER — fixed, transform YO'Q
    <div
      className="fixed inset-x-0 bottom-3 z-[100] px-4 md:hidden"
      style={{ pointerEvents: "none" }}
    >
      {/* INNER — markaziy, transform bilan, pointer events yoniq */}
      <nav
        style={{ pointerEvents: "auto" }}
        className={cn(
          "mx-auto flex max-w-md items-center justify-between gap-1",
          "rounded-full border border-white/20 dark:border-white/10",
          "bg-white/80 dark:bg-zinc-900/85",
          "backdrop-blur-2xl",
          "shadow-2xl shadow-emerald-950/15 dark:shadow-black/60",
          "px-3 py-2"
        )}
      >
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1.5 transition-all duration-200",
                "active:scale-95",
                active
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {active && (
                <span className="pointer-events-none absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-400/15" />
              )}
              <span className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900" />
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[9px] font-bold uppercase tracking-wide",
                  active && "drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
