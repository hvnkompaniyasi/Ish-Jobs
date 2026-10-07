"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type, ...props }, ref) => {
    const inputId = id || props.name;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const actualType = isPassword && showPassword ? "text" : type;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            className={cn(
              "w-full rounded-2xl border bg-white/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 backdrop-blur-xl",
              "transition-all duration-200 focus:outline-none focus:ring-2",
              isPassword && "pr-11",
              error
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500/40"
                : "border-slate-200/60 focus:border-emerald-500/60 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-emerald-500/60",
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Yashirish" : "Ko'rsatish"}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/60 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-zinc-200"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>

        {hint && !error && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-500">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
