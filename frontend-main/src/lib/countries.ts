export interface Country {
  code: string;      // ISO 2-letter
  name: string;      // O'zbekcha nomi
  dial: string;      // +998
  flag: string;      // emoji
  mask?: string;     // ixtiyoriy format
}

export const COUNTRIES: Country[] = [
  { code: "UZ", name: "O'zbekiston", dial: "+998", flag: "🇺🇿" },
  { code: "KZ", name: "Qozog'iston", dial: "+7", flag: "🇰🇿" },
  { code: "KG", name: "Qirg'iziston", dial: "+996", flag: "🇰🇬" },
  { code: "TJ", name: "Tojikiston", dial: "+992", flag: "🇹🇯" },
  { code: "TM", name: "Turkmaniston", dial: "+993", flag: "🇹🇲" },
  { code: "RU", name: "Rossiya", dial: "+7", flag: "🇷🇺" },
  { code: "TR", name: "Turkiya", dial: "+90", flag: "🇹🇷" },
  { code: "AZ", name: "Ozarbayjon", dial: "+994", flag: "🇦🇿" },
  { code: "CN", name: "Xitoy", dial: "+86", flag: "🇨🇳" },
  { code: "KR", name: "Janubiy Koreya", dial: "+82", flag: "🇰🇷" },
  { code: "AE", name: "BAA", dial: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudiya Arabistoni", dial: "+966", flag: "🇸🇦" },
  { code: "DE", name: "Germaniya", dial: "+49", flag: "🇩🇪" },
  { code: "GB", name: "Buyuk Britaniya", dial: "+44", flag: "🇬🇧" },
  { code: "US", name: "AQSH", dial: "+1", flag: "🇺🇸" },
  { code: "FR", name: "Fransiya", dial: "+33", flag: "🇫🇷" },
  { code: "IN", name: "Hindiston", dial: "+91", flag: "🇮🇳" },
  { code: "JP", name: "Yaponiya", dial: "+81", flag: "🇯🇵" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // O'zbekiston
