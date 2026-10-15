"use client";

import { cn, EMPLOYMENT_TYPE_LABELS, EXPERIENCE_LABELS } from "@/lib/utils";
import type { EmploymentType, ExperienceLevel, JobFilters as Filters } from "@/types";
import { LocationFilter, type LocationValue } from "@/components/map/LocationFilter";
import { findRegion } from "@/data/uzbekistan";
import { CATEGORIES, type JobCategory } from "@/lib/categories";

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

const selectCls =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-200 outline-none transition-colors hover:border-zinc-700 focus:border-emerald-500";

export function JobFilters({ filters, onChange }: Props) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const locationValue: LocationValue = {
    region: filters.region ?? null,
    district: filters.district ?? null,
  };

  const handleLocationChange = (v: LocationValue) => {
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

  const chipBase =
    "shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors";
  const chipActive =
    "border-emerald-500/50 bg-emerald-500/15 text-emerald-400";
  const chipIdle =
    "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200";

  return (
    <div className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      {/* Kategoriya */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Kategoriya
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => update("category", "")}
            className={cn(chipBase, !filters.category ? chipActive : chipIdle)}
          >
            Barchasi
          </button>
          {CATEGORIES.map((cat) => {
            const active = filters.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() =>
                  update("category", (active ? "" : cat.value) as JobCategory | "")
                }
                title={cat.label}
                className={cn(chipBase, "inline-flex items-center gap-1", active ? chipActive : chipIdle)}
              >
                <span>{cat.emoji}</span>
                <span>{cat.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ish turi */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
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
                className={cn(chipBase, active ? chipActive : chipIdle)}
              >
                {EMPLOYMENT_TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tajriba */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
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
                className={cn(chipBase, active ? chipActive : chipIdle)}
              >
                {EXPERIENCE_LABELS[l]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manzil */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Manzil
        </h3>
        <LocationFilter value={locationValue} onChange={handleLocationChange} />
      </div>

      {/* Saralash */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Saralash
        </h3>
        <select
          value={filters.sort ?? "newest"}
          onChange={(e) =>
            update("sort", e.target.value as "newest" | "salary" | "views")
          }
          className={selectCls}
        >
          <option value="newest">Eng yangilari</option>
          <option value="salary">Katta maosh</option>
          <option value="views">Ko&apos;p ko&apos;rilganlar</option>
        </select>
      </div>

      {/* Faqat masofadan */}
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={!!filters.isRemote}
          onChange={(e) => update("isRemote", e.target.checked || undefined)}
          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/30"
        />
        <span className="text-sm font-medium text-zinc-300">
          Faqat masofadan
        </span>
      </label>

      {/* Tozalash */}
      <button
        type="button"
        onClick={() => onChange({ page: 1, limit: 10 })}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
      >
        Filtrlarni tozalash
      </button>
    </div>
  );
}
