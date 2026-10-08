"use client";

import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface Props {
  stats: DashboardStats;
}

export function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: "Faol e'lonlar",
      value: `${stats.activeJobs} / ${stats.totalJobs}`,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "from-emerald-500/25 to-emerald-500/5",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 10h18M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
        </svg>
      ),
    },
    {
      label: "Ko'rishlar",
      value: stats.totalViews.toLocaleString(),
      color: "text-blue-600 dark:text-blue-400",
      bg: "from-blue-500/25 to-blue-500/5",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      label: "Arizalar",
      value: stats.totalApplications.toLocaleString(),
      sub: stats.newApplications > 0 ? `+${stats.newApplications} yangi` : null,
      color: "text-violet-600 dark:text-violet-400",
      bg: "from-violet-500/25 to-violet-500/5",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="2" y="6" width="20" height="14" rx="2" />
          <path d="m22 7-10 6L2 7" />
        </svg>
      ),
    },
    {
      label: "Qabul qilindi",
      value: stats.accepted.toLocaleString(),
      sub: `${stats.acceptanceRate}% konversiya`,
      color: "text-amber-600 dark:text-amber-400",
      bg: "from-amber-500/25 to-amber-500/5",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="M22 4 12 14.01l-3-3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c, i) => (
        <div
          key={c.label}
          className="rim relative overflow-hidden rounded-3xl glass p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10 animate-fade-in-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className={cn("pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br blur-3xl", c.bg)} />

          <div className="relative">
            <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md", c.bg, c.color)}>
              {c.icon}
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {c.label}
            </p>
            <p className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              {c.value}
            </p>
            {c.sub && (
              <p className="mt-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {c.sub}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
