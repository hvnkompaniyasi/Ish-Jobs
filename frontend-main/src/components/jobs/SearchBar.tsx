"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
}

export function SearchBar({
  initialValue = "",
  onSearch,
  debounceMs = 300,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSubmittedRef = useRef(initialValue);

  useEffect(() => {
    setValue(initialValue);
    lastSubmittedRef.current = initialValue;
  }, [initialValue]);

  const triggerSearch = (val: string) => {
    const trimmed = val.trim();
    if (trimmed === lastSubmittedRef.current) return;
    lastSubmittedRef.current = trimmed;
    onSearch(trimmed);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => triggerSearch(v), debounceMs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    triggerSearch(value);
  };

  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setValue("");
    lastSubmittedRef.current = "";
    onSearch("");
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
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Lavozim, kalit so'z yoki kompaniya..."
          className="w-full rounded-xl border-0 bg-transparent py-3 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-500"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Tozalash"
            className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
        {isFocused && value.length > 0 && (
          <span className="pointer-events-none absolute right-9 top-1/2 hidden -translate-y-1/2 text-[10px] font-medium text-emerald-500 sm:inline">
            {debounceMs}ms
          </span>
        )}
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
