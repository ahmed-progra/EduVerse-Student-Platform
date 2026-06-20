"use client";

import { useAuthStore } from "@/stores/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { XpBar } from "@/components/ui/xp-bar";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  LayoutDashboard, BookOpen, Swords, Medal, ShoppingBag,
  User, LogOut, Menu, X, GitBranch, ChevronLeft, ChevronDown,
  Brain, Code2, Lightbulb, GraduationCap, FlaskConical, Sparkles, Sprout, Rocket,
  Boxes, Search, ChevronsUpDown, Settings, Library, Megaphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const AIMentorPanel = dynamic(() => import("./ai-mentor-panel").then(m => m.AIMentorPanel), { ssr: false });
const CodeReviewPanel = dynamic(() => import("./ai-review-panel").then(m => m.CodeReviewPanel), { ssr: false });
const HintsPanel = dynamic(() => import("./ai-hints-panel").then(m => m.HintsPanel), { ssr: false });
const ExamPanel = dynamic(() => import("./ai-exam-panel").then(m => m.ExamPanel), { ssr: false });
const ChallengePanel = dynamic(() => import("./ai-challenge-panel").then(m => m.ChallengePanel), { ssr: false });

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
      { href: "/projects", label: "Projects", icon: Rocket },
      { href: "/courses", label: "Courses", icon: BookOpen },
      { href: "/lab", label: "3D Lab", icon: Boxes },
      { href: "/codelab", label: "Code Lab", icon: FlaskConical },
      { href: "/skill-tree", label: "Skill Tree", icon: GitBranch },
    ],
  },
  {
    title: "Academics",
    items: [
      { href: "/resources", label: "Resources", icon: Library },
      { href: "/announcements", label: "Announcements", icon: Megaphone },
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

  // Public pages render without the app shell or auth gate (shareable portfolio included).
  const isPublicPage = pathname.startsWith("/auth") || pathname === "/" || pathname.startsWith("/u/");

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
        style={{ background: "oklch(13% 0.028 262 / 0.92)", backdropFilter: "blur(20px) saturate(160%)", borderBottom: "1px solid var(--color-eduverse-border)" }}>
        <Link href="/dashboard" prefetch={true} className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-display)", color: "var(--color-eduverse-text)", letterSpacing: "-0.02em" }}>
          <Code2 size={20} style={{ color: "var(--color-eduverse-accent)" }} aria-hidden="true" />
          EduVerse
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-eduverse-accent-soft transition-colors"
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
        <div className="p-4 md:p-8 max-w-7xl mx-auto page-enter">
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
  user: { username: string; level: number; xp: number; email?: string } | null;
  pathname: string;
  logout: () => void;
  activePanel: string | null;
  onNavClick: (item: NavItem) => void;
  mobile?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const showFull = !collapsed || mobile;
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [closedSections, setClosedSections] = useState<Record<string, boolean>>({});

  const isActive = (item: NavItem) => {
    if (item.href) return pathname === item.href || pathname.startsWith(item.href + "/");
    if (item.panel) return activePanel === item.panel;
    return false;
  };

  const q = query.trim().toLowerCase();
  const sections = navSections
    .map((s) => ({ ...s, items: q ? s.items.filter((i) => i.label.toLowerCase().includes(q)) : s.items }))
    .filter((s) => s.items.length > 0);

  const renderItem = (item: NavItem) => {
    const active = isActive(item);
    const cls = `side-item ${active ? "active" : ""} ${!showFull ? "collapsed" : ""}`;
    const inner = (
      <>
        <item.icon size={18} aria-hidden="true" />
        {showFull && <span className="side-item-label">{item.label}</span>}
      </>
    );
    if (item.href) {
      return (
        <Link key={item.label} href={item.href} prefetch className={cls} onClick={() => onNavClick(item)} data-label={item.label} aria-label={!showFull ? item.label : undefined} aria-current={active ? "page" : undefined}>
          {inner}
        </Link>
      );
    }
    return (
      <button key={item.label} className={cls} onClick={() => onNavClick(item)} data-label={item.label} aria-label={!showFull ? item.label : undefined} aria-pressed={active}>
        {inner}
      </button>
    );
  };

  return (
    <div className={`sb ${mobile ? "sb-mobile" : "sb-full"} ${!showFull ? "sb-collapsed" : ""}`}>
      {/* Brand header */}
      <div className="sb-head">
        <Link href="/dashboard" prefetch className={`sb-brand ${!showFull ? "sb-brand-collapsed" : ""}`}>
          <span className="sb-brand-mark"><Code2 size={20} aria-hidden="true" /></span>
          {showFull && (
            <span className="sb-brand-text">
              <span className="sb-brand-name">EduVerse</span>
              <span className="sb-brand-sub">code sorcery</span>
            </span>
          )}
        </Link>
        {!mobile && onToggle && (
          <button onClick={onToggle} className="sb-collapse" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {showFull ? <ChevronLeft size={16} /> : <ChevronsUpDown size={15} />}
          </button>
        )}
      </div>

      {/* Search / nav filter */}
      {showFull && (
        <div className="sb-search">
          <Search size={15} aria-hidden="true" />
          <input
            className="sb-search-input"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Filter navigation"
          />
        </div>
      )}

      {/* Nav */}
      <nav className="sb-nav" aria-label="Main">
        {sections.map((section) => {
          const isClosed = !!closedSections[section.title] && showFull && !q;
          return (
            <div key={section.title} className="sb-section">
              {showFull ? (
                <button
                  className="sb-section-head"
                  onClick={() => setClosedSections((c) => ({ ...c, [section.title]: !c[section.title] }))}
                  aria-expanded={!isClosed}
                >
                  <span className="sb-section-label"><span className="sb-section-slash">//</span> {section.title}</span>
                  <ChevronDown size={13} className={`sb-section-chevron ${isClosed ? "closed" : ""}`} aria-hidden="true" />
                </button>
              ) : (
                <div className="sb-section-rule" aria-hidden="true" />
              )}
              {!isClosed && <div className="sb-section-items">{section.items.map(renderItem)}</div>}
            </div>
          );
        })}
        {q && sections.length === 0 && showFull && (
          <p className="sb-no-results">No matches for &ldquo;{query}&rdquo;</p>
        )}
      </nav>

      {showFull && (
        <div className="sb-hint">Press <kbd>/</kbd> for AI Mentor</div>
      )}

      {showFull && user && (
        <div className="sb-xp">
          <div className="sb-xp-row">
            <span>Level {user.level}</span>
            <span className="sb-xp-val">{user.xp} XP</span>
          </div>
          <XpBar xp={user.xp} size="sm" showLabel={false} />
        </div>
      )}

      {/* User card + menu */}
      <div className="sb-user-wrap">
        {menuOpen && <div className="sb-menu-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
        {menuOpen && (
          <div className="sb-user-menu" role="menu">
            <Link href="/profile" prefetch className="sb-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
              <User size={15} aria-hidden="true" /> View profile
            </Link>
            <Link href="/profile" prefetch className="sb-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
              <Settings size={15} aria-hidden="true" /> Account settings
            </Link>
            <button className="sb-menu-item danger" role="menuitem" onClick={() => { setMenuOpen(false); logout(); }}>
              <LogOut size={15} aria-hidden="true" /> Log out
            </button>
          </div>
        )}
        <button
          className={`sb-user ${!showFull ? "collapsed" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          title={!showFull ? user?.username : undefined}
        >
          <span className="sb-user-avatar">{user?.username?.[0]?.toUpperCase() ?? "U"}</span>
          {showFull && (
            <span className="sb-user-info">
              <span className="sb-user-name">{user?.username ?? "User"}</span>
              <span className="sb-user-email">{user?.email ?? `Level ${user?.level ?? 1}`}</span>
            </span>
          )}
          {showFull && <ChevronsUpDown size={15} className="sb-user-chevron" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
