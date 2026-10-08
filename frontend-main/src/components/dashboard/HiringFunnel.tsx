"use client";

import { cn } from "@/lib/utils";
import type { HiringFunnelData } from "@/types";

interface Props {
  funnel: HiringFunnelData;
}

export function HiringFunnel({ funnel }: Props) {
  const { views, applications, shortlisted, accepted } = funnel;

  const steps = [
    { label: "Ko'rishlar", value: views, color: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
    { label: "Arizalar", value: applications, color: "bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
    { label: "Suhbat", value: shortlisted, color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
    { label: "Qabul", value: accepted, color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  ];

  const maxValue = Math.max(...steps.map((s) => s.value), 1);
  const baseValue = views || 1;

  return (
    <div className="rim rounded-3xl glass p-5 sm:p-6 animate-fade-in-up">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
        </span>
        <div>
          <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            Ishga qabul voronkasi
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Konversiya ko&apos;rsatkichlari
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {steps.map((s, i) => {
          const widthPct = Math.max((s.value / maxValue) * 100, s.value > 0 ? 8 : 2);
          const conversion = i === 0
            ? 100
            : baseValue > 0
            ? Math.round((s.value / baseValue) * 1000) / 10
            : 0;

          return (
            <div key={s.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  {s.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 dark:text-white">
                    {s.value.toLocaleString()}
                  </span>
                  {i > 0 && (
                    <span className={cn(
                      "rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold dark:bg-white/5",
                      s.text
                    )}>
                      {conversion}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                <div
                  className={cn("h-full rounded-full transition-all duration-700 ease-out", s.color)}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
