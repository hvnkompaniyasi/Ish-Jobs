"use client";

import { useMemo } from "react";
import { REGIONS } from "@/data/uzbekistan";
import { cn } from "@/lib/utils";

export interface LocationValue {
  region: string | null;
  district: string | null;
}

interface LocationFilterProps {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  className?: string;
}

export function LocationFilter({ value, onChange, className }: LocationFilterProps) {
  const districts = useMemo(() => {
    const r = REGIONS.find((x) => x.name === value.region);
    return r?.districts ?? [];
  }, [value.region]);

  const selectCls =
    "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none transition-colors hover:border-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700";

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <select
        value={value.region ?? ""}
        onChange={(e) =>
          onChange({ region: e.target.value || null, district: null })
        }
        className={selectCls}
        aria-label="Viloyat"
      >
        <option value="">Viloyat</option>
        {REGIONS.map((r) => (
          <option key={r.name} value={r.name}>
            {r.short}
          </option>
        ))}
      </select>

      <select
        value={value.district ?? ""}
        onChange={(e) =>
          onChange({ ...value, district: e.target.value || null })
        }
        disabled={!value.region}
        className={selectCls}
        aria-label="Tuman yoki shahar"
      >
        <option value="">Tuman / shahar</option>
        {districts.map((d) => (
          <option key={d.name} value={d.name}>
            {d.name}
          </option>
        ))}
      </select>
    </div>
  );
}
