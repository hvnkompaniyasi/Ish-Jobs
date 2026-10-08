"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TopJob } from "@/types";

interface Props {
  jobs: TopJob[];
}

export function TopJobsList({ jobs }: Props) {
  const max = Math.max(...jobs.map((j) => j.applications), 1);

  return (
    <div className="rim rounded-3xl glass p-5 sm:p-6 animate-fade-in-up">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </span>
        <div>
          <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            Eng yaxshi e&apos;lonlar
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Arizalar soni bo&apos;yicha
          </p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500 dark:text-zinc-400">
          Hozircha ma&apos;lumot yo&apos;q
        </p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => {
            const widthPct = Math.max((job.applications / max) * 100, 4);
            return (
              <Link
                key={job.jobId}
                href={`/jobs/${job.jobId}`}
                className="group block rounded-2xl border border-slate-200/60 bg-white/40 p-3 backdrop-blur-xl transition hover:border-emerald-500/40 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-[10px] font-black text-white shadow-md shadow-emerald-500/30">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm font-bold text-slate-900 transition group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                      {job.title}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    {job.applications}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700",
                    )}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
