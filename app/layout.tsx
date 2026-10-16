import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "STUDIOFORM - Interior Architecture for Commercial, Hospitality & Retail",
    template: "%s | STUDIOFORM",
  },
  description:
    "STUDIOFORM is an interior architecture studio delivering commercial workplaces, hospitality venues, retail flagships and residential towers across India.",
  metadataBase: new URL("https://studioform.in"),
  openGraph: {
    title: "STUDIOFORM - Interior Architecture",
    description:
      "B2B interior architecture portfolio: workplaces, hospitality, retail and residential.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
