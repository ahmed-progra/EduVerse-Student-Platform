import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/** Absolute base for canonical + Open Graph URLs. Set NEXT_PUBLIC_SITE_URL in production. */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK"],
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

const title = "EduVerse - See Your Code Run, Line by Line";
const description =
  "A student-built learning platform with a step-by-step code visualizer, daily challenges, and AI hints. Python, HTML, CSS, and C++.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s | EduVerse" },
  description,
  applicationName: "EduVerse",
  keywords: [
    "learn to code",
    "code visualizer",
    "Python",
    "C++",
    "HTML",
    "CSS",
    "programming for students",
    "coding challenges",
    "AI coding tutor",
    "interactive coding",
  ],
  authors: [{ name: "EduVerse" }],
  creator: "EduVerse",
  category: "education",
  alternates: { canonical: "/" },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23CC8800'/><text x='16' y='22' text-anchor='middle' fill='white' font-size='18' font-weight='bold' font-family='system-ui'>E</text></svg>",
  },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "EduVerse", statusBarStyle: "black-translucent" },
  openGraph: {
    type: "website",
    siteName: "EduVerse",
    title,
    description,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0e111a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <div className="app-ambient" aria-hidden="true">
          <div className="ambient-aurora" />
          <div className="ambient-twinkle" />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
