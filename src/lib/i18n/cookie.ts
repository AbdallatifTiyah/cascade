// Shared between server (get-locale.ts) and client (locale-switcher.tsx)
// code, so it must not import anything server-only like next/headers.
export const LOCALE_COOKIE = "NEXT_LOCALE";
