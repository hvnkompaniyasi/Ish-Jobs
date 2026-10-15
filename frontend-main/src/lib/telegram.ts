/**
 * Universal Telegram username normalizer + deep-link builder.
 *
 * Qabul qiladi:
 *   "@username", "username", "https://t.me/username",
 *   "t.me/username", "http://t.me/username", "+998901234567" (telefon)
 *
 * Qaytaradi:
 *   Tozalangan username (phone bo'lsa null)
 */

export interface TelegramInput {
  username?: string | null;
  phone?: string | null;
}

export interface TelegramLinkOptions {
  jobTitle?: string;
  textTemplate?: (jobTitle: string) => string;
}

const TELEGRAM_HOSTS = ["t.me", "telegram.me", "www.t.me"];

/** @ belgisini va URL prefikslarini olib tashlaydi */
export function normalizeTelegramUsername(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!s) return null;

  // Telefon raqam (faqat raqam va + - ( ) bo'sh joy) — username emas
  const digitsOnly = s.replace(/[^\d]/g, "");
  if (/^[+\d\s()-]+$/.test(s) && digitsOnly.length >= 8) {
    return null;
  }

  // URL prefikslari
  try {
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s);
      const host = u.hostname.replace(/^www\./i, "");
      if (!TELEGRAM_HOSTS.includes(host)) return null;
      s = u.pathname.replace(/^\/+/, "");
    } else if (/^t\.me\//i.test(s) || /^telegram\.me\//i.test(s)) {
      s = s.replace(/^[^/]+\//, "");
    }
  } catch {
    // URL emas — davom etamiz
  }

  // @ belgisi
  s = s.replace(/^@+/, "");

  // Faqat username uchun ruxsat etilgan belgilar
  s = s.replace(/[^\w]/g, "");

  // Telegram username: 5-32 belgi, harfdan boshlanadi
  if (s.length < 3 || s.length > 32) return null;
  if (!/^[a-zA-Z]/.test(s)) return null;

  return s;
}

/** Telefon raqamni t.me/+998... formatiga aylantiradi */
export function normalizeTelegramPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  let s2 = s;
  if (/^https?:\/\//i.test(s2)) {
    try {
      const u = new URL(s2);
      const host = u.hostname.replace(/^www\./i, "");
      if (!TELEGRAM_HOSTS.includes(host)) return null;
      s2 = u.pathname.replace(/^\/+/, "");
    } catch {
      return null;
    }
  }
  s2 = s2.replace(/^@+/, "").replace(/\s+/g, "");
  if (!s2) return null;
  if (!s2.startsWith("+")) s2 = "+" + s2.replace(/^\+/, "");
  const digits = s2.slice(1).replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return "+" + digits;
}

const DEFAULT_TEXT = (jobTitle: string) =>
  `Assalomu alaykum! IshJobs orqali "${jobTitle}" vakansiyasini ko'rdim. Suhbatga yozilmoqchiman.`;

/**
 * Universal Telegram deep-link builder.
 * Username yoki telefon orqali ishlaydi.
 */
export function buildTelegramUrl(
  input: TelegramInput,
  options: TelegramLinkOptions = {},
): string | null {
  const username = normalizeTelegramUsername(input.username);
  const phone = normalizeTelegramPhone(input.phone);

  const base = username
    ? `https://t.me/${username}`
    : phone
      ? `https://t.me/${phone}`
      : null;

  if (!base) return null;

  const textFn = options.textTemplate ?? DEFAULT_TEXT;
  const text = options.jobTitle ? textFn(options.jobTitle) : null;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
