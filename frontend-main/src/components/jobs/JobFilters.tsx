"use client";

import { cn, EMPLOYMENT_TYPE_LABELS, EXPERIENCE_LABELS } from "@/lib/utils";
import type { EmploymentType, ExperienceLevel, JobFilters as Filters } from "@/types";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const EMPLOYMENT_TYPES: EmploymentType[] = [
  "full-time",
  "part-time",
  "contract",
  "internship",
  "remote",
];

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "intern",
  "junior",
  "middle",
  "senior",
  "lead",
];

export function JobFilters({ filters, onChange }: Props) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="rim space-y-5 rounded-3xl glass p-5">
      {/* Ish turi */}
      <div>
        <h3 className="mb-2.5 text-sm font-bold text-slate-900 dark:text-white">
          Ish turi
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {EMPLOYMENT_TYPES.map((t) => {
            const active = filters.employmentType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => update("employmentType", active ? "" : t)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 dark:bg-emerald-500"
                    : "border border-slate-200/60 bg-white/60 text-slate-700 hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-400"
                )}
              >
                {EMPLOYMENT_TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tajriba */}
      <div>
        <h3 className="mb-2.5 text-sm font-bold text-slate-900 dark:text-white">
          Tajriba
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {EXPERIENCE_LEVELS.map((l) => {
            const active = filters.experienceLevel === l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => update("experienceLevel", active ? "" : l)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 dark:bg-emerald-500"
                    : "border border-slate-200/60 bg-white/60 text-slate-700 hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-400"
                )}
              >
                {EXPERIENCE_LABELS[l]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shahar */}
      <div>
        <h3 className="mb-2.5 text-sm font-bold text-slate-900 dark:text-white">
          Shahar
        </h3>
        <input
          type="text"
          value={filters.city || ""}
          onChange={(e) => update("city", e.target.value)}
          placeholder="Toshkent, Samarqand..."
          className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 backdrop-blur-xl focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Remote */}
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={!!filters.isRemote}
          onChange={(e) => update("isRemote", e.target.checked || undefined)}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800"
        />
        <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
          Faqat masofadan
        </span>
      </label>

      {/* Tozalash */}
      <button
        type="button"
        onClick={() => onChange({ page: 1, limit: 10 })}
        className="w-full rounded-xl border border-slate-200/60 bg-white/60 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur-xl transition hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-400"
      >
        Filtrlarni tozalash
      </button>
    </div>
  );
}
