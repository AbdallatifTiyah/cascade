import type { Metadata } from "next";
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
