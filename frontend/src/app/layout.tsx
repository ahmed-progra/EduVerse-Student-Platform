import type { Metadata } from "next";
import { Bricolage_Grotesque, Work_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const sans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "EduVerse - See Your Code Run, Line by Line", template: "%s | EduVerse" },
  description: "A student-built learning platform with a step-by-step code visualizer, daily challenges, and AI hints. Python, HTML, CSS, and C++.",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%237c3aed'/><text x='16' y='22' text-anchor='middle' fill='white' font-size='18' font-weight='bold' font-family='system-ui'>E</text></svg>" },
  appleWebApp: { title: "EduVerse" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
