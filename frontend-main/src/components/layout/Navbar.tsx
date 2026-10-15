"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/I18nProvider";
import type { UserRole } from "@/types";

function getNavLinks(
  t: (k: string) => string,
  isEmployer: boolean,
  isAuthenticated: boolean,
) {
  if (isEmployer) {
    return [
      { href: "/resumes", label: t("nav.resumes"), exact: true },
      { href: "/jobs/my", label: t("nav.myJobs"), exact: true },
      { href: "/dashboard", label: t("nav.dashboard"), exact: true },
    ] as const;
  }
  return [
    { href: "/jobs", label: t("nav.jobs"), exact: true },
    { href: "/jobs/map", label: t("nav.map"), exact: true },
    { href: "/resumes", label: t("nav.resumes") },
    ...(isAuthenticated
      ? [
          {
            href: "/applications/my",
            label: t("nav.applications"),
            exact: true,
          } as const,
        ]
      : []),
  ] as const;
}

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const t = useT();

  const activeRole: UserRole = user?.activeRole || user?.role || "seeker";
  const isEmployer = activeRole === "employer";

  return (
    <div className="fixed inset-x-0 top-3 z-50 mx-auto max-w-5xl px-3 sm:top-4 sm:px-4">
      <header className="rim rounded-full border border-white/60 bg-white/70 px-2.5 py-2 shadow-xl shadow-emerald-950/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/60 dark:shadow-black/50 sm:px-5 sm:py-3">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {/* ═══════ Logo ═══════ */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 rounded-full pl-1 pr-2 transition-colors"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-black text-white shadow-lg shadow-emerald-500/40 transition-transform group-hover:scale-105 sm:h-10 sm:w-10">
              ij
              <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/40" />
            </span>
            <span className="hidden text-base font-black tracking-tight text-slate-900 sm:block dark:text-white">
              ish
              <span className="text-emerald-600 dark:text-emerald-400">
                jobs
              </span>
            </span>
          </Link>

          {/* ═══════ Mode indicator ═══════ */}
          {isAuthenticated && (
            <Link
              href="/profile"
              title={isEmployer ? t("nav.modeEmployer") : t("nav.modeSeeker")}
              className={cn(
                "ml-1 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors sm:ml-2 sm:px-2.5",
                isEmployer
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30"
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/30",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isEmployer ? "bg-amber-500" : "bg-indigo-500",
                )}
              />
              <span className="hidden sm:inline">
                {isEmployer
                  ? t("nav.modeEmployerShort")
                  : t("nav.modeSeekerShort")}
              </span>
              <span className="sm:hidden">
                {isEmployer ? "IB" : "IQ"}
              </span>
            </Link>
          )}

          {/* ═══════ Desktop nav ═══════ */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {getNavLinks(t, isEmployer, isAuthenticated).map((l) => {
              const active =
                pathname === l.href ||
                (!(l as { exact?: boolean }).exact &&
                  pathname.startsWith(l.href + "/"));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white",
                  )}
                >
                  {l.label}
                  {active && (
                    <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ═══════ Right side ═══════ */}
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <div className="hidden md:block">
                  <NotificationBell />
                </div>

                {isEmployer && (
                  <Link href="/jobs/create" className="hidden sm:block">
                    <Button size="sm" className="rounded-full">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="mr-1"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      {t("nav.createJob")}
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-full">
                    {t("nav.register")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
