"use client";

import { useAuthStore } from "@/stores/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { XpBar } from "@/components/ui/xp-bar";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  LayoutDashboard, BookOpen, Swords, Medal, ShoppingBag,
  User, LogOut, Menu, X, GitBranch, ChevronLeft,
  Brain, Code2, Lightbulb, GraduationCap, FlaskConical, Sparkles, Sprout,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AIMentorPanel } from "./ai-mentor-panel";
import { CodeReviewPanel } from "./ai-review-panel";
import { HintsPanel } from "./ai-hints-panel";
import { ExamPanel } from "./ai-exam-panel";
import { ChallengePanel } from "./ai-challenge-panel";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  panel?: string;
};

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Learn",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/mentor", label: "AI Coach", icon: Sparkles },
      { href: "/apprentice", label: "Apprentice", icon: Sprout },
      { href: "/courses", label: "Courses", icon: BookOpen },
      { href: "/codelab", label: "Code Lab", icon: FlaskConical },
      { href: "/skill-tree", label: "Skill Tree", icon: GitBranch },
    ],
  },
  {
    title: "Compete",
    items: [
      { href: "/battle", label: "Battle", icon: Swords },
      { href: "/leaderboard", label: "Leaderboard", icon: Medal },
      { href: "/shop", label: "Shop", icon: ShoppingBag },
    ],
  },
  {
    title: "AI Tools",
    items: [
      { panel: "mentor", label: "AI Mentor", icon: Brain },
      { panel: "exam", label: "Exam Mode", icon: GraduationCap },
      { panel: "review", label: "Code Review", icon: Code2 },
      { panel: "hints", label: "Hints", icon: Lightbulb },
      { panel: "challenges", label: "Challenges", icon: GitBranch },
    ],
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, loadUser, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const isPublicPage = pathname.startsWith("/auth") || pathname === "/";

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadUser(); setMounted(true); }, []);
  useEffect(() => { setActivePanel(null); setMobileOpen(false); }, [pathname]);

  // Gate app pages: unauthenticated visitors get sent to login instead of a broken shell
  useEffect(() => {
    if (!isPublicPage && mounted && !isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isPublicPage, mounted, isLoading, isAuthenticated, router]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) setMobileOpen(false);
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>("[data-ai-shortcut]");
        if (input) input.focus();
        else setActivePanel("mentor");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  if (isPublicPage) return <>{children}</>;

  if ((isLoading && !mounted) || (!isAuthenticated && mounted && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" role="status" aria-label="Loading" />
      </div>
    );
  }

  const handleNavClick = (item: NavItem) => {
    if (item.panel) { setActivePanel(item.panel); setMobileOpen(false); }
  };

  return (
    <div className="min-h-screen">
      {/* Ambient background lives in root layout.tsx */}

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ background: "oklch(14% 0.022 295 / 0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--color-eduverse-border)" }}>
        <Link href="/dashboard" className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-eduverse-text)" }}>EduVerse</Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg"
          style={{ color: "var(--color-eduverse-text-body)" }}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <SidebarContent user={user} pathname={pathname} logout={logout} activePanel={activePanel} onNavClick={handleNavClick} mobile />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-[width] duration-300 z-30 ${collapsed ? "lg:w-20" : "lg:w-64"}`}>
        <SidebarContent user={user} pathname={pathname} logout={logout} activePanel={activePanel} onNavClick={handleNavClick} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      <main className={`transition-[padding] duration-300 pt-16 lg:pt-0 min-h-screen ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <div key={activePanel ?? pathname} className="p-4 md:p-8 max-w-7xl mx-auto page-enter">
          {activePanel ? (
            <ErrorBoundary><AIPanel panel={activePanel} onClose={() => setActivePanel(null)} /></ErrorBoundary>
          ) : children}
        </div>
      </main>
    </div>
  );
}

function AIPanel({ panel, onClose }: { panel: string; onClose: () => void }) {
  switch (panel) {
    case "mentor": return <AIMentorPanel onClose={onClose} />;
    case "exam": return <ExamPanel onClose={onClose} />;
    case "review": return <CodeReviewPanel onClose={onClose} />;
    case "hints": return <HintsPanel onClose={onClose} />;
    case "challenges": return <ChallengePanel onClose={onClose} />;
    default: return null;
  }
}

function SidebarContent({
  user, pathname, logout, activePanel, onNavClick, mobile, collapsed, onToggle,
}: {
  user: { username: string; level: number; xp: number } | null;
  pathname: string;
  logout: () => void;
  activePanel: string | null;
  onNavClick: (item: NavItem) => void;
  mobile?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const showFull = !collapsed || mobile;

  const isActive = (item: NavItem) => {
    if (item.href) return pathname === item.href || pathname.startsWith(item.href + "/");
    if (item.panel) return activePanel === item.panel;
    return false;
  };

  return (
    <div
      className={`flex flex-col h-full ${mobile ? "relative w-72" : "w-full"}`}
      style={{ background: "var(--color-eduverse-surface)", borderRight: "1px solid var(--color-eduverse-border)" }}
    >
      <div className="px-5 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--color-eduverse-border)" }}>
        <Link
          href="/dashboard"
          className={`font-bold ${showFull ? "text-xl" : "text-sm mx-auto"}`}
          style={{ fontFamily: "var(--font-display)", color: "var(--color-eduverse-text)", letterSpacing: "-0.02em" }}
        >
          {showFull ? "EduVerse" : "EV"}
        </Link>
        {!mobile && onToggle && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg transition-colors hover:bg-eduverse-accent-soft"
            style={{ color: "var(--color-eduverse-text-muted)" }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {user && showFull && (
        <div className="p-4 border-b" style={{ borderColor: "var(--color-eduverse-border)" }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-lg font-bold shrink-0 font-mono" style={{ color: "var(--color-eduverse-accent)" }}>
              {user.username[0].toUpperCase()}
            </span>
            <div className="overflow-hidden">
              <div className="font-semibold text-sm truncate font-mono" style={{ color: "var(--color-eduverse-text)" }}>{user.username}</div>
              <div className="text-xs font-mono" style={{ color: "var(--color-eduverse-text-muted)" }}>Level {user.level}</div>
            </div>
          </div>
          <XpBar xp={user.xp} size="sm" showLabel={false} />
        </div>
      )}

      {user && !showFull && (
        <div className="p-3 border-b flex justify-center" style={{ borderColor: "var(--color-eduverse-border)" }}>
          <span className="text-sm font-bold font-mono" style={{ color: "var(--color-eduverse-accent)" }}>
            {user.username[0].toUpperCase()}
          </span>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Main">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            {showFull && (
              <div className="flex items-center gap-2 px-3 mb-1.5 text-xs font-mono" style={{ color: "var(--color-eduverse-text-muted)" }}>
                <span style={{ color: "var(--color-eduverse-accent)" }}>//</span>
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item);
                const cls = `side-item ${active ? "active" : ""} ${!showFull ? "collapsed" : ""}`;
                if (item.href) {
                  return (
                    <Link key={item.label} href={item.href} className={cls} onClick={() => onNavClick(item)} title={!showFull ? item.label : undefined} aria-current={active ? "page" : undefined}>
                      <item.icon size={18} aria-hidden="true" />
                      {showFull && item.label}
                    </Link>
                  );
                }
                return (
                  <button key={item.label} className={cls} onClick={() => onNavClick(item)} title={!showFull ? item.label : undefined} aria-pressed={active}>
                    <item.icon size={18} aria-hidden="true" />
                    {showFull && item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {showFull && (
        <div className="px-5 pb-2 text-[10px]" style={{ color: "var(--color-eduverse-text-muted)", opacity: 0.6 }}>
          Press <kbd>/</kbd> for AI Mentor
        </div>
      )}

      <div className="p-3 space-y-0.5" style={{ borderTop: "1px solid var(--color-eduverse-border)" }}>
        <Link href="/profile" className={`side-item ${pathname.startsWith("/profile") ? "active" : ""} ${!showFull ? "collapsed" : ""}`} title={!showFull ? "Profile" : undefined}>
          <User size={18} aria-hidden="true" />
          {showFull && "Profile"}
        </Link>
        <button onClick={logout} className={`side-item danger ${!showFull ? "collapsed" : ""}`} title={!showFull ? "Logout" : undefined}>
          <LogOut size={18} aria-hidden="true" />
          {showFull && "Logout"}
        </button>
      </div>
    </div>
  );
}
