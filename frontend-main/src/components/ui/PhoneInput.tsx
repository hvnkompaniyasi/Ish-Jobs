"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  name?: string;
}

export function PhoneInput({
  label, value, onChange, error, hint, required, name = "phone",
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { country, local } = useMemo(() => {
    if (!value) return { country: DEFAULT_COUNTRY, local: "" };
    const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
    for (const c of sorted) {
      if (value.startsWith(c.dial)) {
        return { country: c, local: value.slice(c.dial.length) };
      }
    }
    return { country: DEFAULT_COUNTRY, local: value.replace(/^\+/, "") };
  }, [value]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [search]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleLocalChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 12);
    onChange(digits ? `${country.dial}${digits}` : "");
  };

  const handleCountrySelect = (c: Country) => {
    onChange(local ? `${c.dial}${local}` : "");
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="w-full" ref={wrapperRef}>
      {label && (
        <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-zinc-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={cn(
            "flex w-full items-stretch rounded-2xl border bg-white/60 backdrop-blur-xl transition-all duration-200 focus-within:ring-2",
            error
              ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500/20 dark:border-rose-500/40"
              : "border-slate-200/60 focus-within:border-emerald-500/60 focus-within:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-emerald-500/60"
          )}
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-l-2xl border-r border-slate-200/60 px-3 text-sm font-bold text-slate-700 transition hover:bg-white/60 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
            aria-label="Davlat kodini tanlash"
          >
            <span className="text-lg leading-none">{country.flag}</span>
            <span className="font-bold">{country.dial}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={cn("text-slate-400 transition dark:text-zinc-500", open && "rotate-180")}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <input
            type="tel"
            name={name}
            inputMode="numeric"
            value={local}
            onChange={(e) => handleLocalChange(e.target.value)}
            placeholder="90 123 45 67"
            className="flex-1 rounded-r-2xl bg-transparent px-3 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-500"
          />
        </div>

        {open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-2xl shadow-emerald-950/10 backdrop-blur-2xl animate-fade-in-up dark:border-white/10 dark:bg-zinc-900/95 dark:shadow-black/60">
            <div className="border-b border-slate-100/80 p-2 dark:border-white/5">
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Davlat qidirish..."
                className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-3 py-2 text-sm font-medium focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-slate-500 dark:text-zinc-400">
                  Davlat topilmadi
                </div>
              ) : (
                filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-white/60 dark:hover:bg-white/5",
                      c.code === country.code && "bg-emerald-50/60 dark:bg-emerald-500/10"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-lg">{c.flag}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                    </span>
                    <span className="font-medium text-slate-500 dark:text-zinc-400">{c.dial}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-500">{hint}</p>
      )}
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
