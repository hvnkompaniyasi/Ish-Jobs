"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "glass";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 hover:shadow-emerald-500/50 dark:bg-emerald-500 dark:hover:bg-emerald-400",
  secondary:
    "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
  outline:
    "border border-slate-300/80 bg-white/60 text-slate-700 backdrop-blur-sm hover:bg-white hover:border-emerald-500/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:border-emerald-500/40",
  ghost:
    "text-slate-700 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-white/5",
  danger:
    "bg-rose-600 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400",
  glass:
    "rim border border-white/60 bg-white/70 text-slate-900 backdrop-blur-xl hover:bg-white/90 hover:border-emerald-500/40 shadow-lg shadow-emerald-950/5 dark:border-white/10 dark:bg-zinc-900/60 dark:text-white dark:hover:bg-zinc-900/80 dark:hover:border-emerald-500/40 dark:shadow-black/40",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-xl",
  md: "h-11 px-5 text-sm rounded-2xl",
  lg: "h-12 px-6 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-bold",
          // Micro-interactions: hover scale + active press
          "transition-all duration-200 ease-out",
          "hover:scale-[1.02] active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:ring-offset-2 focus:ring-offset-transparent",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
