import { cookies } from "next/headers";
import { defaultLocale, type Locale } from "./index";
import { LOCALE_COOKIE } from "./cookie";

// Server-only: reads the locale cookie so any Server Component can render
// the right dictionary and direction without prop-drilling. No cookie yet
// (first-ever visit) falls back to defaultLocale (Arabic).
export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return value === "en" || value === "ar" ? value : defaultLocale;
}
