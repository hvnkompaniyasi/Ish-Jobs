import type { ApplicationStatus } from "@/types";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Yuborilgan",
  reviewing: "Ko'rilmoqda",
  shortlisted: "Tanlangan",
  interview: "Suhbat",
  accepted: "Qabul qilindi",
  rejected: "Rad etilgan",
  withdrawn: "Olib tashlangan",
};

export const APPLICATION_STATUS_COLORS: Record<
  ApplicationStatus,
  { bg: string; text: string; border: string }
> = {
  pending: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  reviewing: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  shortlisted: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  interview: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  accepted: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  rejected: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  withdrawn: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
  },
};

export function statusLabel(status: ApplicationStatus): string {
  return APPLICATION_STATUS_LABELS[status] || status;
}
