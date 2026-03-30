import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://titlecomply.com",
  ),
  title: {
    default:
      "TitleComply — FinCEN Compliance Automation for Title & Escrow",
    template: "%s | TitleComply",
  },
  description:
    "Automate FinCEN Real Estate Report compliance for title companies. Screen transactions, collect data, extract documents with AI, and generate filings in 15 minutes.",
  keywords: [
    "FinCEN",
    "Real Estate Report",
    "title company compliance",
    "FinCEN filing",
    "31 CFR Part 1031",
    "beneficial ownership",
    "anti-money laundering",
    "title company software",
    "escrow compliance",
    "BSA E-Filing",
  ],
  authors: [{ name: "TitleComply" }],
  creator: "TitleComply",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://titlecomply.com",
    siteName: "TitleComply",
    title:
      "TitleComply — FinCEN Compliance Automation for Title & Escrow",
    description:
      "Automate FinCEN Real Estate Report compliance. Screen, collect, extract, and file in 15 minutes.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "TitleComply — FinCEN Compliance Automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TitleComply — FinCEN Compliance Automation",
    description:
      "Automate FinCEN Real Estate Report compliance for title companies.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
