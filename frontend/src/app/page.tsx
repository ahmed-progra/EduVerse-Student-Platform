"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { api } from "@/lib/api";
import HeroDemo from "@/components/landing/hero-demo";
import { Code2, Sparkles, Network, Swords, Medal, ShoppingBag, Flame, ChevronRight, Menu, X } from "lucide-react";

const features = [
  { icon: Code2, title: "Code Visualizer", desc: "Watch execution line by line with live variable tracking.", href: "/codelab" },
  { icon: Sparkles, title: "AI Co-Pilot", desc: "Error diagnosis, hints, and exam prep that explain instead of solve.", href: "/courses" },
  { icon: Network, title: "Skill Tree", desc: "RPG-style progression. Click a node, load the example, run it.", href: "/skill-tree" },
  { icon: Swords, title: "Coding Battles", desc: "Real-time duels. Same problem, two editors, one winner.", href: "/battle" },
  { icon: Medal, title: "Leaderboard", desc: "Climb the campus ranks one challenge at a time.", href: "/leaderboard" },
  { icon: ShoppingBag, title: "Rewards Shop", desc: "Spend earned XP on cosmetics and power-ups.", href: "/shop" },
];

const challengeData = [
  { title: "Find the Missing Number", lang: "Python", diff: "easy", desc: "Given an array of n-1 integers from 1 to n, find the missing number." },
  { title: "Reverse a String Without Built-ins", lang: "Python", diff: "easy", desc: "Reverse a string using only loops and character access." },
  { title: "Debounce From Scratch", lang: "JavaScript", diff: "medium", desc: "Implement a debounce function that limits how often a function can fire." },
  { title: "Flatten a Nested Array", lang: "JavaScript", diff: "medium", desc: "Write a function that flattens a deeply nested array into one level." },
  { title: "Binary Search, No Library", lang: "Algorithms", diff: "medium", desc: "Implement binary search without using any built-in methods." },
  { title: "Count Islands in a Grid", lang: "Algorithms", diff: "hard", desc: "Given a 2D grid of '1's and '0's, count the number of islands." },
];

const diffLabel: Record<string, string> = {
  easy: "Easy · great to start",
  medium: "Medium · think harder",
  hard: "Hard · earn it",
};

const steps = [
  { n: "01", title: "Pick a challenge", desc: "Choose from challenges across Python, JavaScript, and Algorithms, each designed to push you a little further." },
  { n: "02", title: "Write real code", desc: "Open the built-in editor, write your solution, and submit. Instant AI feedback on your approach, not just pass or fail." },
  { n: "03", title: "Watch it run", desc: "Step through your solution in the visualizer, see every variable change, and earn XP for every challenge solved." },
];

function getDailyChallenge() {
  const idx = new Date().toDateString().split(" ").join("").length % challengeData.length;
  return challengeData[idx];
}

function getMidnight() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 0).getTime() - n.getTime();
}

function updateStreak(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem("eduverse_streak");
  const today = new Date().toDateString();
  if (!raw) {
    localStorage.setItem("eduverse_streak", JSON.stringify({ count: 1, date: today }));
    return 1;
  }
  const { count, date } = JSON.parse(raw);
  if (date === today) return count;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (date === yesterday) {
    const next = count + 1;
    localStorage.setItem("eduverse_streak", JSON.stringify({ count: next, date: today }));
    return next;
  }
  localStorage.setItem("eduverse_streak", JSON.stringify({ count: 1, date: today }));
  return 1;
}

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: ["#E2A43B", "#EFC97E", "#3FBE8C", "#ECB44E", "#F2EDE4"][Math.floor(Math.random() * 5)],
    delay: Math.random() * 0.3,
    size: Math.random() * 4 + 3,
  }));
  return (
    <div className="confetti-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            top: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dailyChallenge] = useState(getDailyChallenge);
  const [countdown, setCountdown] = useState("");
  const [streak, setStreak] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [filter, setFilter] = useState("All");
  const [confetti, setConfetti] = useState(false);
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const [challengeCode, setChallengeCode] = useState("");
  const [codeResult, setCodeResult] = useState("");
  const [codeResultTag, setCodeResultTag] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  useScrollReveal();

  useEffect(() => {
    setStreak(updateStreak());
    if (typeof window !== "undefined" && !localStorage.getItem("eduverse_visited")) {
      setShowWelcome(true);
      setTimeout(() => {
        setShowWelcome(false);
        localStorage.setItem("eduverse_visited", "true");
      }, 4000);
    }
  }, []);

  useEffect(() => {
    const update = () => {
      const ms = getMidnight();
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setCountdown(`${h}h ${m}m`);
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);

  const submitChallengeCode = useCallback(async () => {
    if (!challengeCode.trim() || codeLoading) return;
    setCodeLoading(true);
    setCodeResult("");
    const loggedIn = typeof window !== "undefined" && !!localStorage.getItem("eduverse_token");
    if (loggedIn) {
      // Signed-in visitors get a real AI review of their attempt.
      try {
        const started = Date.now();
        const res = await api.aiReview(challengeCode, "python");
        setCodeResult(res.data.text);
        setCodeResultTag(`${res.data.model || "Gemini"} · ${((Date.now() - started) / 1000).toFixed(1)}s`);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 1500);
      } catch (err: unknown) {
        setCodeResult(err instanceof Error ? err.message : "AI review failed. Try again.");
        setCodeResultTag("");
      } finally {
        setCodeLoading(false);
      }
      return;
    }
    // Logged-out visitors see an honestly-labeled sample of what AI review looks like.
    setTimeout(() => {
      setCodeResult("Score: 7/10. Logic is correct but O(n²) complexity detected. Use a hash map for an O(n) single pass.");
      setCodeResultTag("Sample review — log in for live AI feedback");
      setCodeLoading(false);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1500);
    }, 1200);
  }, [challengeCode, codeLoading]);

  const filteredChallenges = filter === "All"
    ? challengeData
    : challengeData.filter((c) => c.lang === filter || c.diff === filter.toLowerCase());

  const filters = ["All", "Python", "JavaScript", "Algorithms", "Easy", "Hard"];

  const toggleChallenge = (title: string) => {
    setExpandedChallenge((prev) => prev === title ? null : title);
    setChallengeCode("");
    setCodeResult("");
    setCodeResultTag("");
  };

  return (
    <div className="landing-page">
      <div className="hero-glow" aria-hidden="true" />
      <Confetti active={confetti} />

      {/* ─── NAVBAR ─── */}
      <nav className="landing-nav intro" style={{ "--d": "0s" } as React.CSSProperties}>
        <Link href="/" className="landing-logo">
          <Code2 size={22} aria-hidden="true" />
          EduVerse
        </Link>
        <ul className="landing-nav-links">
          <li><a href="#features" className="nav-link">Features</a></li>
          <li><a href="#challenges" className="nav-link">Challenges</a></li>
          <li><a href="/courses" className="nav-link">Courses</a></li>
          <li><a href="/codelab" className="nav-link">Code Lab</a></li>
        </ul>
        <div className="flex items-center gap-2">
          <Link href="/auth/register" className="nav-cta">
            Get started
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="nav-menu-btn lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="mobile-nav lg:hidden">
          <ul>
            <li><a href="#features" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Features</a></li>
            <li><a href="#challenges" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Challenges</a></li>
            <li><Link href="/courses" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Courses</Link></li>
            <li><Link href="/codelab" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Code Lab</Link></li>
          </ul>
        </div>
      )}

      {/* ─── HERO ─── */}
      <section className="landing-hero">
        <div className="hero-copy">
          <p className="hero-kicker intro" style={{ "--d": "0.05s" } as React.CSSProperties}>
            <span aria-hidden="true">{"//"}</span> a student-built learning platform
          </p>
          <h1 className="hero-title reveal-rise" style={{ "--d": "0.13s" } as React.CSSProperties}>
            See your code run,<br /><span className="hero-highlight">line by line.</span>
          </h1>
          <p className="hero-desc intro" style={{ "--d": "0.21s" } as React.CSSProperties}>
            EduVerse runs your code step by step and shows every variable change as it
            happens. AI hints when you&apos;re stuck. A new challenge every day.
          </p>
          <div className="hero-btns intro" style={{ "--d": "0.29s" } as React.CSSProperties}>
            <Link href="/auth/register" className="btn-primary">
              Start learning free
            </Link>
            <Link href="/codelab" className="btn-outline">
              Open the Code Lab
            </Link>
          </div>
          <p className="hero-facts intro" style={{ "--d": "0.37s" } as React.CSSProperties}>
            4 languages&ensp;·&ensp;120 lessons&ensp;·&ensp;$0, no paywalls
          </p>
        </div>
        <div className="hero-demo-col intro" style={{ "--d": "0.3s" } as React.CSSProperties}>
          <HeroDemo />
        </div>
      </section>

      {/* ─── FEATURE COLUMNS ─── */}
      <section id="features" className="landing-section">
        <div className="sec-header rv">
          <p className="sec-kicker">Features</p>
          <h2 className="sec-title">Tools that teach, not just test</h2>
          <p className="sec-sub">Everything is built around one idea: you learn faster when you can see what the machine is doing.</p>
        </div>

        <div className="feature-rule" aria-hidden="true" />
        <div className="feature-grid">
          {features.map((f, i) => (
            <div key={f.title} className="feature-col rv" style={{ "--reveal-delay": `${(i % 3) * 0.08}s` } as React.CSSProperties}>
              <div className="feature-col-head">
                <f.icon size={17} aria-hidden="true" />
                <h3>{f.title}</h3>
              </div>
              <p>{f.desc}</p>
              <Link href={f.href} className="feature-col-link">
                Learn more <ChevronRight size={13} aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CHALLENGES ─── */}
      <section id="challenges" className="landing-section">
        <div className="sec-header rv">
          <p className="sec-kicker">Challenges</p>
          <h2 className="sec-title">A new one every day</h2>
          <p className="sec-sub">Solve it right here on the page. <span className="countdown">Today&apos;s resets in {countdown}.</span></p>
        </div>

        <div className="challenge-daily rv">
          <span className="challenge-daily-tag">Today</span>
          <div className="challenge-daily-body">
            <h3 className="challenge-title">{dailyChallenge.title}</h3>
            <p className="challenge-desc">{dailyChallenge.desc}</p>
            <div className="challenge-meta">
              <span className={`diff-badge diff-${dailyChallenge.diff}`}>{diffLabel[dailyChallenge.diff]}</span>
              <span className="challenge-lang">{dailyChallenge.lang}</span>
            </div>
          </div>
        </div>

        <div className="challenge-filter rv">
          {filters.map((f) => (
            <button
              key={f}
              className={`challenge-filter-btn ${filter === f ? "challenge-filter-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="challenge-grid">
          {filteredChallenges.map((c, i) => (
            <div
              key={c.title}
              className={`challenge-card intro ${expandedChallenge === c.title ? "open" : ""}`}
              style={{ "--d": `${(i % 3) * 0.05}s` } as React.CSSProperties}
              onClick={() => toggleChallenge(c.title)}
            >
              <h3 className="challenge-title">{c.title}</h3>
              <p className="challenge-desc">{c.desc}</p>
              <div className="challenge-meta">
                <span className={`diff-badge diff-${c.diff}`}>{diffLabel[c.diff]}</span>
                <span className="challenge-lang">{c.lang}</span>
              </div>

              {expandedChallenge === c.title && (
                <div className="challenge-editor" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    className="challenge-textarea"
                    placeholder="Write your solution here..."
                    value={challengeCode}
                    onChange={(e) => setChallengeCode(e.target.value)}
                    rows={6}
                  />
                  <button className="challenge-submit" onClick={submitChallengeCode} disabled={!challengeCode.trim() || codeLoading}>
                    {codeLoading ? "Running..." : "Submit code"}
                  </button>
                  {codeResult && (
                    <div className="challenge-result">
                      <p>{codeResult}</p>
                      {codeResultTag && <span className="challenge-result-tag">{codeResultTag}</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="landing-section">
        <div className="sec-header rv">
          <p className="sec-kicker">How it works</p>
          <h2 className="sec-title">Three steps, no tutorials</h2>
        </div>
        <div className="steps-row">
          {steps.map((step, i) => (
            <div key={step.n} className="step-col rv" style={{ "--reveal-delay": `${i * 0.1}s` } as React.CSSProperties}>
              <span className="step-num">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA BAND ─── */}
      <section className="landing-band">
        <div className="rv">
          <h2 className="band-title">Built by students,<br /><span className="band-hl">for students.</span></h2>
          <p className="band-sub">
            No paywalls, no fake numbers. Real challenges that prepare you for real interviews.
          </p>
          <Link href="/auth/register" className="btn-primary">Create a free account</Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div>
            <Link href="/" className="landing-logo footer-logo">
              <Code2 size={18} aria-hidden="true" />
              EduVerse
            </Link>
            <p className="footer-tagline">No fluff. Just code.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <a href="#features">Features</a>
            <a href="#challenges">Challenges</a>
            <Link href="/courses">Courses</Link>
            <Link href="/skill-tree">Skill Tree</Link>
          </nav>
          <p className="footer-copy">EduVerse &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>

      {streak > 0 && (
        <div className="streak-chip">
          <Flame size={15} aria-hidden="true" />
          <span>{streak} day streak</span>
          {streak > 7 && <span className="streak-onfire">On fire!</span>}
        </div>
      )}

      {showWelcome && (
        <div className="welcome-toast">
          <span>Welcome! Start with today&apos;s daily challenge ↗</span>
        </div>
      )}
    </div>
  );
}
