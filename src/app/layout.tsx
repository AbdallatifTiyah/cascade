import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getLocale } from "@/lib/i18n/get-locale";
import { isRtl } from "@/lib/i18n";
import { plusJakarta, cairo } from "./fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "كاسكيد — للاستثمار والتطوير العقاري",
    template: "%s · كاسكيد",
  },
  description:
    "أخبر كاسكيد بما تحتاجه وما تقدر عليه. كاسكيد تطابقك مع فرص تطوير عقاري مصممة حول خطتك.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cascade",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const rtl = isRtl(locale);
  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"} className={cn(plusJakarta.variable, cairo.variable)}>
      <body className={cn(rtl ? "font-arabic" : "font-sans", "antialiased")}>
        <noscript>
          <style>{".reveal { opacity: 1 !important; transform: none !important; }"}</style>
        </noscript>
        <Providers>{children}</Providers>
        <Script id="register-sw" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); }); }`}
        </Script>
      </body>
    </html>
  );
}
