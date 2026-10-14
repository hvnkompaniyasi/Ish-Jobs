"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks";
import { useT } from "@/i18n/I18nProvider";
import { notificationsService } from "@/services";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const t = useT();
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
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  const leftItems = [
    {
      href: "/",
      label: t("nav.home"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
      ),
    },
    {
      href: "/jobs",
      label: t("nav.jobs"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
  ];

  const rightItems = [
    {
      href: "/jobs/map",
      label: t("nav.map"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      href: isAuthenticated ? (isEmployer ? "/dashboard" : "/profile") : "/login",
      label: isAuthenticated ? (isEmployer ? t("nav.dashboard") : t("nav.profile")) : t("nav.login"),
      badge: unreadCount > 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const centerHref = isAuthenticated
    ? isEmployer
      ? "/jobs/create"
      : "/resumes/create"
    : "/register";
  const centerLabel = isAuthenticated
    ? isEmployer
      ? t("nav.createJob")
      : t("nav.createResume")
    : t("nav.start");

  const NavItem = ({ item }: { item: (typeof leftItems)[0] & { badge?: boolean } }) => {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        aria-label={item.label}
        className="group relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
      >
        {active && (
          <span className="pointer-events-none absolute inset-x-1 -top-1 -bottom-1 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/15" />
        )}
        <span
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300",
            active
              ? "text-emerald-600 dark:text-emerald-400 scale-110"
              : "text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:scale-105"
          )}
        >
          {item.icon}
          {item.badge && (
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900" />
            </span>
          )}
        </span>
        <span
          className={cn(
            "text-[9px] font-bold uppercase tracking-wider transition-all duration-300",
            active
              ? "text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]"
              : "text-slate-500 dark:text-zinc-500"
          )}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] md:hidden"
      style={{ pointerEvents: "none" }}
    >
      <div
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
        className="px-4"
      >
        <nav
          style={{ pointerEvents: "auto" }}
          className={cn(
            "relative mx-auto flex max-w-md items-center justify-between gap-0.5",
            "rounded-[28px] border border-white/30 dark:border-white/10",
            "bg-white/80 dark:bg-zinc-900/85",
            "backdrop-blur-2xl backdrop-saturate-150",
            "shadow-[0_10px_40px_-8px_rgba(6,78,59,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)]",
            "dark:shadow-[0_10px_40px_-8px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.08)]",
            "px-2 py-2"
          )}
        >
          {leftItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}

          <Link
            href={centerHref}
            aria-label={centerLabel}
            className="group relative -mt-7 flex flex-col items-center"
          >
            <span className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/30 blur-2xl transition-opacity duration-300 group-hover:bg-emerald-500/50" />
            <span
              className={cn(
                "relative flex h-14 w-14 items-center justify-center rounded-full",
                "bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700",
                "text-white shadow-[0_8px_20px_-4px_rgba(16,185,129,0.7),inset_0_1px_1px_rgba(255,255,255,0.4)]",
                "ring-4 ring-white/90 dark:ring-zinc-900/90",
                "transition-all duration-300 group-hover:scale-105 group-active:scale-95"
              )}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent opacity-70" />
            </span>
            {isAuthenticated && (
              <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {centerLabel}
              </span>
            )}
          </Link>

          {rightItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>
      </div>
    </div>
  );
}
