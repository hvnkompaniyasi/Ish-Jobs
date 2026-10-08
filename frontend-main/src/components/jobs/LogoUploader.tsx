"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LogoUploaderProps {
  value?: string | null;
  file: File | null;
  onChange: (file: File | null, preview: string | null) => void;
  error?: string;
}

const MAX_SIZE = 3 * 1024 * 1024;
const ALLOWED_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function LogoUploader({
  value,
  file,
  onChange,
  error,
}: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setLocalError(null);

    if (f.size > MAX_SIZE) {
      setLocalError("Logotip 3 MB dan oshmasligi kerak");
      return;
    }
    if (!ALLOWED_MIMES.includes(f.type)) {
      setLocalError("Faqat JPEG, PNG yoki WEBP");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      onChange(f, dataUrl);
    };
    reader.readAsDataURL(f);
  };

  const handleRemove = () => {
    setPreview(null);
    setLocalError(null);
    onChange(null, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const shownError = error || localError;

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-zinc-300">
        Kompaniya logotipi
      </label>

      <div className="flex items-center gap-4">
        {/* Preview / placeholder */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl",
            "border-2 border-dashed border-slate-300 bg-white/40 transition-all",
            "hover:border-emerald-500/60 hover:bg-emerald-50/40",
            "dark:border-zinc-700 dark:bg-white/[0.03] dark:hover:border-emerald-500/40",
            "active:scale-95"
          )}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Logo"
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>
            </>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-400 transition group-hover:text-emerald-500"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          )}
        </button>

        {/* Info + actions */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {file
              ? file.name
              : preview
              ? "Mavjud logotip"
              : "JPEG, PNG yoki WEBP. Max 3 MB."}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-slate-300/60 bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur-sm transition hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-400"
            >
              {preview ? "O'zgartirish" : "Tanlash"}
            </button>
            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-lg border border-rose-200/60 bg-rose-50/60 px-3 py-1.5 text-xs font-semibold text-rose-600 backdrop-blur-sm transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
              >
                Olib tashlash
              </button>
            )}
          </div>

          {shownError && (
            <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
              {shownError}
            </p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
