export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatSalary(
  salary?: { min?: number | null; max?: number | null; currency?: string; isNegotiable?: boolean }
): string {
  if (!salary) return "Kelishilgan";
  if (salary.isNegotiable) return "Kelishilgan";
  if (!salary.min && !salary.max) return "Kelishilgan";
  const currency = salary.currency || "UZS";
  const fmt = (n: number) => new Intl.NumberFormat("uz-UZ").format(n);
  if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)} ${currency}`;
  if (salary.min) return `${fmt(salary.min)}+ ${currency}`;
  return `${fmt(salary.max!)} ${currency}`;
}

export function formatDate(date: string): string {
  try {
    return new Intl.DateTimeFormat("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "hozir";
  if (mins < 60) return `${mins} daqiqa oldin`;
  if (hours < 24) return `${hours} soat oldin`;
  if (days < 30) return `${days} kun oldin`;
  return formatDate(date);
}

export function initials(first?: string, last?: string): string {
  const f = first?.[0] || "";
  const l = last?.[0] || "";
  return (f + l).toUpperCase() || "U";
}

export function fullName(user?: { firstName?: string; lastName?: string }): string {
  if (!user) return "";
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "full-time": "To'liq stavka",
  "part-time": "Yarim stavka",
  contract: "Shartnoma",
  internship: "Amaliyot",
  remote: "Masofadan",
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  intern: "Amaliyotchi",
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead: "Lead",
};
