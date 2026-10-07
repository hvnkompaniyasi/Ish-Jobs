"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (value: string) => void;
}

export function SearchBar({ initialValue = "", onSearch }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rim flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 p-1.5 shadow-2xl shadow-emerald-950/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/50 dark:shadow-black/40"
    >
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Lavozim, kalit so'z yoki kompaniya..."
          className="w-full rounded-xl border-0 bg-transparent py-3 pl-10 pr-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-500"
        />
      </div>
      <Button type="submit" size="md" className="shrink-0 rounded-xl">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="hidden sm:inline">Qidirish</span>
      </Button>
    </form>
  );
}
