import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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

export const metadata: Metadata = {
  title: { default: "EduVerse - See Your Code Run, Line by Line", template: "%s | EduVerse" },
  description: "A student-built learning platform with a step-by-step code visualizer, daily challenges, and AI hints. Python, HTML, CSS, and C++.",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23CC8800'/><text x='16' y='22' text-anchor='middle' fill='white' font-size='18' font-weight='bold' font-family='system-ui'>E</text></svg>" },
  appleWebApp: { title: "EduVerse" },
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
