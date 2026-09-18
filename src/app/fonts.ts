import { Plus_Jakarta_Sans, Cairo } from "next/font/google";

// Two locale-specific type families instead of system fonts — this is the
// single highest-impact visual upgrade for an Arabic-first product: system
// Arabic fonts (Tahoma/Arial fallback) look dated, while Cairo is a proper
// designed Arabic typeface with the same geometric character as the Latin
// pairing, so both languages feel like one coherent brand.
export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});
