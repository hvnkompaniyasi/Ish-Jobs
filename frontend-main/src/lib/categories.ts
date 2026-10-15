export type JobCategory =
  | "it"
  | "sales"
  | "restaurant"
  | "logistics"
  | "construction"
  | "manufacturing"
  | "education"
  | "healthcare"
  | "finance"
  | "marketing"
  | "office"
  | "security"
  | "beauty"
  | "agriculture"
  | "services"
  | "gig"
  | "other";

export interface CategoryItem {
  value: JobCategory;
  label: string;
  short: string;
  emoji: string;
}

export const CATEGORIES: CategoryItem[] = [
  { value: "it",            label: "IT va Dasturlash",              short: "IT",          emoji: "💻" },
  { value: "sales",         label: "Savdo va Sotuv",                short: "Savdo",       emoji: "🛒" },
  { value: "restaurant",    label: "Restoran va Ovqatlanish",       short: "Restoran",    emoji: "🍽️" },
  { value: "logistics",     label: "Transport va Haydovchilik",     short: "Transport",   emoji: "🚚" },
  { value: "construction",  label: "Qurilish va Ta'mirlash",        short: "Qurilish",    emoji: "🏗️" },
  { value: "manufacturing", label: "Ishlab chiqarish va Tikuvchilik", short: "Ishlab chiq.", emoji: "🏭" },
  { value: "education",     label: "Ta'lim va Fan",                 short: "Ta'lim",      emoji: "📚" },
  { value: "healthcare",    label: "Tibbiyot va Farmatsevtika",     short: "Tibbiyot",    emoji: "🏥" },
  { value: "finance",       label: "Buxgalteriya va Moliya",        short: "Moliya",      emoji: "💰" },
  { value: "marketing",     label: "Marketing, Dizayn va SMM",      short: "Marketing",   emoji: "📢" },
  { value: "office",        label: "Ma'muriy boshqaruv va Ofis",    short: "Ofis",        emoji: "📋" },
  { value: "security",      label: "Xavfsizlik va Qo'riqlash",      short: "Xavfsizlik",  emoji: "🛡️" },
  { value: "beauty",        label: "Go'zallik va Sport",            short: "Go'zallik",   emoji: "✨" },
  { value: "agriculture",   label: "Qishloq xo'jaligi",             short: "Qishloq",     emoji: "🌾" },
  { value: "services",      label: "Xizmat ko'rsatish va Klining",  short: "Xizmat",      emoji: "🧹" },
  { value: "gig",           label: "Kunbay va Vaqtinchalik ishlar", short: "Kunbay",      emoji: "⏱️" },
  { value: "other",         label: "Boshqa sohalar",                short: "Boshqa",      emoji: "📌" },
];

export const CATEGORY_MAP: Record<string, CategoryItem> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c]),
);

export function getCategoryLabel(value: string | undefined | null): string {
  if (!value) return "Boshqa";
  return CATEGORY_MAP[value]?.label ?? value;
}

export function getCategoryShort(value: string | undefined | null): string {
  if (!value) return "Boshqa";
  return CATEGORY_MAP[value]?.short ?? value;
}

export function getCategoryEmoji(value: string | undefined | null): string {
  if (!value) return "📌";
  return CATEGORY_MAP[value]?.emoji ?? "📌";
}
