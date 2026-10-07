"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl",
          size === "sm" && "max-w-sm",
          size === "md" && "max-w-md",
          size === "lg" && "max-w-lg"
        )}
      >
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
