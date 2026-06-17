import "server-only";

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  es: () => import("@/dictionaries/es.json").then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;

export const locales = Object.keys(dictionaries) as Locale[];

export function isLocale(value: string): value is Locale {
  return value in dictionaries;
}

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
