import en from "./en";
import ar from "./ar";

export type { Dictionary } from "./types";

const dictionaries = { ar, en } as const;

export type Locale = keyof typeof dictionaries;

export const defaultLocale: Locale = "ar";
export const isRtl = (locale: Locale) => locale === "ar";

export function getDictionary(locale: Locale = defaultLocale) {
  return dictionaries[locale];
}
