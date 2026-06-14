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

// Deterministic ember field (fixed values → no SSR/hydration mismatch).
const EMBERS = [
  { left: "8%", dur: "19s", delay: "-2s" },
  { left: "18%", dur: "23s", delay: "-9s" },
  { left: "27%", dur: "16s", delay: "-5s" },
  { left: "38%", dur: "21s", delay: "-13s" },
  { left: "47%", dur: "25s", delay: "-3s" },
  { left: "56%", dur: "18s", delay: "-11s" },
  { left: "64%", dur: "22s", delay: "-7s" },
  { left: "73%", dur: "17s", delay: "-15s" },
  { left: "81%", dur: "24s", delay: "-6s" },
  { left: "89%", dur: "20s", delay: "-1s" },
  { left: "34%", dur: "27s", delay: "-18s" },
  { left: "69%", dur: "15s", delay: "-10s" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <div className="app-ambient" aria-hidden="true">
          <div className="amb-aura amb-aura-1" />
          <div className="amb-aura amb-aura-2" />
          <div className="amb-aura amb-aura-3" />
          <div className="amb-embers">
            {EMBERS.map((e, i) => (
              <i key={i} style={{ left: e.left, animationDuration: e.dur, animationDelay: e.delay }} />
            ))}
          </div>
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
