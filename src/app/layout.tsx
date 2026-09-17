import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Cascade — Real Estate Investment & Development",
    template: "%s · Cascade",
  },
  description:
    "Tell Cascade what you need and what you can afford. Cascade matches you with real estate development opportunities designed around your plan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
