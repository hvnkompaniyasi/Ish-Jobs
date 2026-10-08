"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/hooks";
import { Spinner } from "@/components/ui/Spinner";
import { getErrorMessage } from "@/services";
import { initials, cn } from "@/lib/utils";

export function AvatarUploader() {
  const { user, uploadAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("Rasm 3 MB dan oshmasligi kerak");
      return;
    }

    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setError("Faqat JPEG, PNG yoki WEBP rasm yuklang");
      return;
    }

    setError(null);
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    try {
      await uploadAvatar(file);
      setTimeout(() => setPreview(null), 300);
    } catch (err) {
      setError(getErrorMessage(err));
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const avatarSrc = preview || user?.avatarUrl;
  const showImage = !!avatarSrc;

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full",
          "bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-black text-white",
          "shadow-2xl shadow-emerald-500/40 ring-4 ring-white/40 transition-all",
          "hover:scale-105 hover:ring-white/60 active:scale-95",
          "dark:ring-white/10",
          uploading && "cursor-wait"
        )}
      >
        {showImage ? (
          <img
            src={avatarSrc!}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials(user?.firstName, user?.lastName)}</span>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
          {uploading ? (
            <Spinner className="h-6 w-6" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          )}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />

      {error && (
        <p className="mt-2 max-w-[200px] text-center text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      <p className="mt-2 text-center text-[10px] font-medium text-slate-500 dark:text-zinc-500">
        {uploading ? "Yuklanmoqda..." : "Rasmni o'zgartirish"}
      </p>
    </div>
  );
}
