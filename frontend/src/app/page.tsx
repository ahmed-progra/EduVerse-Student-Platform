"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { api } from "@/services/api-client";
import HeroDemo from "@/features/landing/hero-demo";
import { Confetti } from "@/components/ui/confetti";
import {
  Code2, Sparkles, Network, Swords, Medal, ShoppingBag, Flame, ChevronRight, Menu, X,
  Boxes, BookOpen, Library, Sigma, Orbit, FlaskConical,
} from "lucide-react";

const features = [
  { icon: BookOpen, title: "Every Subject", desc: "Programming, math, physics, and science — one catalog, one progress system.", href: "/courses" },
  { icon: Sparkles, title: "Your AI Tutor", desc: "A coach that adapts to you: explains, hints, quizzes, and plans your week.", href: "/mentor" },
  { icon: Boxes, title: "Interactive 3D Labs", desc: "Explore math surfaces, orbital physics, and molecular science you can rotate.", href: "/lab" },
  { icon: Code2, title: "Step-through Visualizer", desc: "Watch code and concepts unfold line by line, with live state.", href: "/codelab" },
  { icon: Library, title: "Resources & Library", desc: "Keep notes, study guides, and materials for every class in one place.", href: "/resources" },
  { icon: Network, title: "Skill Tree & Progress", desc: "Turn studying into momentum — unlock skills, climb ranks, earn rewards.", href: "/skill-tree" },
];

const subjects = [
  { name: "Python", group: "Programming", icon: Code2 },
  { name: "HTML", group: "Programming", icon: Code2 },
  { name: "CSS", group: "Programming", icon: Code2 },
  { name: "C++", group: "Programming", icon: Code2 },
  { name: "Mathematics", group: "Sciences", icon: Sigma },
  { name: "Physics", group: "Sciences", icon: Orbit },
  { name: "Science", group: "Sciences", icon: FlaskConical },
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
          <li><a href="#subjects" className="nav-link">Subjects</a></li>
          <li><a href="#features" className="nav-link">Features</a></li>
          <li><Link href="/courses" className="nav-link">Courses</Link></li>
          <li><Link href="/lab" className="nav-link">3D Labs</Link></li>
        </ul>
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="nav-link hidden sm:inline-flex">
            Log in
          </Link>
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
            <li><a href="#subjects" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Subjects</a></li>
            <li><a href="#features" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Features</a></li>
            <li><Link href="/courses" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Courses</Link></li>
            <li><Link href="/lab" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>3D Labs</Link></li>
            <li><Link href="/auth/login" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Log in</Link></li>
          </ul>
        </div>
      )}

      {/* ─── HERO ─── */}
      <section className="landing-hero">
        <div className="hero-beams" aria-hidden="true">
          <div className="beam-ray" />
        </div>
        <div className="hero-copy">
          <p className="hero-kicker intro" style={{ "--d": "0.05s" } as React.CSSProperties}>
            <span aria-hidden="true">{"//"}</span> a student-built academic companion
          </p>
          <h1 className="hero-title reveal-rise" style={{ "--d": "0.13s" } as React.CSSProperties}>
            Every subject you study,<br /><span className="hero-highlight">finally in one place.</span>
          </h1>
          <p className="hero-desc intro" style={{ "--d": "0.21s" } as React.CSSProperties}>
            Programming, math, physics, and science — with an AI tutor that adapts to you,
            step-through visualizers, and interactive 3D labs. Built by students, for students.
          </p>
          <div className="hero-btns intro" style={{ "--d": "0.29s" } as React.CSSProperties}>
            <Link href="/auth/register" className="glow-pill">
              Start learning free
            </Link>
            <Link href="/courses" className="glass-pill">
              Explore subjects
            </Link>
          </div>
          <p className="hero-facts intro" style={{ "--d": "0.37s" } as React.CSSProperties}>
            7 subjects&ensp;·&ensp;AI tutor&ensp;·&ensp;3D labs&ensp;·&ensp;$0, no paywalls
          </p>
        </div>
        <div className="hero-stage intro" style={{ "--d": "0.34s" } as React.CSSProperties}>
          <div className="hero-stage-frame">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* ─── SUBJECTS ─── */}
      <section id="subjects" className="landing-section">
        <div className="sec-header rv">
          <p className="sec-kicker">Subjects</p>
          <h2 className="sec-title">One platform, every subject</h2>
          <p className="sec-sub">From your first line of Python to orbital mechanics and the double helix — programming and the sciences, under one roof.</p>
        </div>
        <div className="subjects-grid">
          {subjects.map((s, i) => (
            <Link
              key={s.name}
              href="/courses"
              className="subject-chip rv"
              style={{ "--reveal-delay": `${(i % 4) * 0.06}s` } as React.CSSProperties}
            >
              <span className="subject-chip-icon"><s.icon size={18} aria-hidden="true" /></span>
              <span className="subject-chip-name">{s.name}</span>
              <span className="subject-chip-group">{s.group}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── FEATURE COLUMNS ─── */}
      <section id="features" className="landing-section">
        <div className="sec-header rv">
          <p className="sec-kicker">Everything you need</p>
          <h2 className="sec-title">A complete academic companion</h2>
          <p className="sec-sub">Every subject, an AI tutor, interactive labs, and a progress system that turns studying into momentum — one unified experience.</p>
        </div>

        <div className="feature-bento">
          {features.map((f, i) => (
            <Link
              key={f.title}
              href={f.href}
              className="feature-card glass-panel glass-panel-link rv"
              style={{ "--reveal-delay": `${(i % 3) * 0.08}s` } as React.CSSProperties}
            >
              <span className="feature-icon"><f.icon size={20} aria-hidden="true" /></span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="feature-go">
                Learn more <ChevronRight size={13} aria-hidden="true" />
              </span>
            </Link>
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
              role="button"
              tabIndex={0}
              aria-expanded={expandedChallenge === c.title}
              onClick={() => toggleChallenge(c.title)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
                  e.preventDefault();
                  toggleChallenge(c.title);
                }
              }}
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
        <div className="beam-up" aria-hidden="true" />
        <div className="rv" style={{ position: "relative" }}>
          <h2 className="band-title">Built by students,<br /><span className="band-hl">for students.</span></h2>
          <p className="band-sub">
            No paywalls, no fake numbers. Real challenges that prepare you for real interviews.
          </p>
          <Link href="/auth/register" className="glow-pill">Create a free account</Link>
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
            <p className="footer-tagline">Every subject. One home.</p>
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
