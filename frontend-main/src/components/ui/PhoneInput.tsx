"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  label?: string;
  value: string;            // to'liq: +998901234567
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  name?: string;
}

export function PhoneInput({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  name = "phone",
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Value'dan davlat va local raqamni ajratish
  const { country, local } = useMemo(() => {
    if (!value) return { country: DEFAULT_COUNTRY, local: "" };

    // Eng uzun dial kod bilan mos keladigan davlatni topish
    const sorted = [...COUNTRIES].sort(
      (a, b) => b.dial.length - a.dial.length
    );
    for (const c of sorted) {
      if (value.startsWith(c.dial)) {
        return { country: c, local: value.slice(c.dial.length) };
      }
    }
    // Fallback
    return { country: DEFAULT_COUNTRY, local: value.replace(/^\+/, "") };
  }, [value]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  // Tashqariga bosishda yopish
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
    // Faqat raqamlar
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
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={cn(
            "flex w-full items-stretch rounded-xl border bg-white transition focus-within:ring-2",
            error
              ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500/20"
              : "border-slate-300 focus-within:border-indigo-500 focus-within:ring-indigo-500/20"
          )}
        >
          {/* Country selector */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-l-xl border-r border-slate-200 px-3 text-sm text-slate-700 transition hover:bg-slate-50"
            aria-label="Davlat kodini tanlash"
          >
            <span className="text-lg leading-none">{country.flag}</span>
            <span className="font-medium">{country.dial}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={cn(
                "text-slate-400 transition",
                open && "rotate-180"
              )}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Local number */}
          <input
            type="tel"
            name={name}
            inputMode="numeric"
            value={local}
            onChange={(e) => handleLocalChange(e.target.value)}
            placeholder="90 123 45 67"
            className="flex-1 rounded-r-xl bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 p-2">
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Davlat qidirish..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-slate-500">
                  Davlat topilmadi
                </div>
              ) : (
                filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-slate-50",
                      c.code === country.code && "bg-indigo-50"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-lg">{c.flag}</span>
                      <span className="font-medium text-slate-900">
                        {c.name}
                      </span>
                    </span>
                    <span className="text-slate-500">{c.dial}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {hint && !error && (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
