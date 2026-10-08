"use client";

import { cn } from "@/lib/utils";

export interface ResumeFilterValues {
  search: string;
  location: string;
  skill: string;
}

interface Props {
  values: ResumeFilterValues;
  onChange: (values: ResumeFilterValues) => void;
}

export function ResumeFilters({ values, onChange }: Props) {
  const update = (k: keyof ResumeFilterValues, v: string) =>
    onChange({ ...values, [k]: v });

  return (
    <div className="rim space-y-4 rounded-3xl glass p-5">
      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-zinc-300">
          Kasb / lavozim
        </label>
        <input
          type="text"
          value={values.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Frontend dasturchi..."
          className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 backdrop-blur-xl focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-zinc-300">
          Shahar
        </label>
        <input
          type="text"
          value={values.location}
          onChange={(e) => update("location", e.target.value)}
          placeholder="Toshkent..."
          className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 backdrop-blur-xl focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-zinc-300">
          Ko&apos;nikma
        </label>
        <input
          type="text"
          value={values.skill}
          onChange={(e) => update("skill", e.target.value)}
          placeholder="React, Python..."
          className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 backdrop-blur-xl focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
        />
      </div>

      <button
        type="button"
        onClick={() => onChange({ search: "", location: "", skill: "" })}
        className={cn(
          "w-full rounded-2xl border border-slate-200/60 bg-white/60 py-2.5 text-sm font-bold text-slate-700 backdrop-blur-xl transition",
          "hover:border-indigo-500/40 hover:text-indigo-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-400"
        )}
      >
        Filtrlarni tozalash
      </button>
    </div>
  );
}
