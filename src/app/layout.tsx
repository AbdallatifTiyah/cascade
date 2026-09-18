import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getLocale } from "@/lib/i18n/get-locale";
import { isRtl } from "@/lib/i18n";

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
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Script id="register-sw" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); }); }`}
        </Script>
      </body>
    </html>
  );
}
