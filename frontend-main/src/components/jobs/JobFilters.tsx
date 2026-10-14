"use client";

import { cn, EMPLOYMENT_TYPE_LABELS, EXPERIENCE_LABELS } from "@/lib/utils";
import type { EmploymentType, ExperienceLevel, JobFilters as Filters } from "@/types";
import { LocationFilter, type LocationValue } from "@/components/map/LocationFilter";
import { findRegion } from "@/data/uzbekistan";

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

  const locationValue: LocationValue = {
    region: filters.region ?? null,
    district: filters.district ?? null,
  };

  const handleLocationChange = (v: LocationValue) => {
    // Region tanlangan bo'lsa, backend city maydoniga region.short yuboramiz
    const region = findRegion(v.region);
    const cityQuery = v.district
      ? v.district
      : region
        ? region.cityMatch[0] ?? region.short
        : "";

    onChange({
      ...filters,
      region: v.region ?? undefined,
      district: v.district ?? undefined,
      city: cityQuery || undefined,
      page: 1,
    });
  };

  const chipActive =
    "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 dark:bg-emerald-500";
  const chipIdle =
    "border border-slate-200/60 bg-white/60 text-slate-700 hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-400";

  return (
    <div className="rim space-y-5 rounded-3xl glass p-5">
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
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  active ? chipActive : chipIdle,
                )}
              >
                {EMPLOYMENT_TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>
      </div>

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
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  active ? chipActive : chipIdle,
                )}
              >
                {EXPERIENCE_LABELS[l]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2.5 text-sm font-bold text-slate-900 dark:text-white">
          Manzil
        </h3>
        <LocationFilter value={locationValue} onChange={handleLocationChange} />
      </div>

      <div>
        <h3 className="mb-2.5 text-sm font-bold text-slate-900 dark:text-white">
          Saralash
        </h3>
        <select
          value={filters.sort ?? "newest"}
          onChange={(e) => update("sort", e.target.value as "newest" | "salary" | "views")}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none transition-colors hover:border-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700"
        >
          <option value="newest">Eng yangilari</option>
          <option value="salary">Katta maosh</option>
          <option value="views">Ko'p ko'rilganlar</option>
        </select>
      </div>

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

      <button
        type="button"
        onClick={() => onChange({ page: 1, limit: 10 })}
        className="w-full rounded-xl border border-slate-200/60 bg-white/60 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur-xl transition-colors hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-400"
      >
        Filtrlarni tozalash
      </button>
    </div>
  );
}
