import en from "./en";

const dictionaries = { en } as const;

export type Locale = keyof typeof dictionaries;

export const defaultLocale: Locale = "en";
export const isRtl = (_locale: Locale) => false;

export function getDictionary(locale: Locale = defaultLocale) {
  return dictionaries[locale];
}
