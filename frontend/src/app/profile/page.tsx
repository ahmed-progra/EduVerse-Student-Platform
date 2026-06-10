"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { XpBar } from "@/components/ui/xp-bar";
import { GradientButton } from "@/components/ui/gradient-button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  Zap, BookOpen, Swords, GitBranch, ShoppingBag,
  Medal, Calendar, Mail, Edit3, Upload,
  Flame, Trophy, Target, Award, BarChart3, TrendingUp,
  Star, Layers
} from "lucide-react";

interface ProfileData {
  id: string;
  email: string;
  username: string;
  avatar: string;
  bio: string | null;
  level: number;
  xp: number;
  rank: number;
  placementLevel: string;
  createdAt: string;
  progress: { lessonId: string; completed: boolean; lesson: { courseId: string; title: string } }[];
  inventory: { itemId: string; equipped: boolean; item: { name: string; type: string; imageUrl: string } }[];
  skills: { skillId: string; unlocked: boolean; skill: { name: string } }[];
  xpLogs: { id: string; amount: number; source: string; createdAt: string }[];
}

const tierColors: Record<string, string> = {
  beginner: "text-eduverse-accent-light",
  intermediate: "text-eduverse-success",
  advanced: "text-eduverse-warning",
};

const tierBadgeColors: Record<string, string> = {
  beginner: "bg-eduverse-accent/20 text-eduverse-accent-light",
  intermediate: "bg-eduverse-success/20 text-eduverse-success",
  advanced: "bg-eduverse-warning/20 text-eduverse-warning",
};

function getAchievements(profile: ProfileData, streak: number) {
  const lessonsDone = profile.progress?.filter(p => p.completed).length || 0;
  const skillsUnlocked = profile.skills?.filter(s => s.unlocked).length || 0;
  const itemsOwned = profile.inventory?.length || 0;
  const battlesWon = 0; // Not in profile yet, default 0
  const level = profile.level;
  const xp = profile.xp;

  return [
    { id: "first_lesson", label: "First Steps", desc: "Complete your first lesson", earned: lessonsDone >= 1, icon: BookOpen },
    { id: "scholar", label: "Scholar", desc: "Complete 30 lessons", earned: lessonsDone >= 30, icon: BookOpen },
    { id: "level_5", label: "Rising Star", desc: "Reach level 5", earned: level >= 5, icon: TrendingUp },
    { id: "level_10", label: "Code Master", desc: "Reach level 10", earned: level >= 10, icon: Trophy },
    { id: "xp_1000", label: "Century", desc: "Earn 1,000 XP", earned: xp >= 1000, icon: Zap },
    { id: "xp_5000", label: "Powerhouse", desc: "Earn 5,000 XP", earned: xp >= 5000, icon: Zap },
    { id: "skills_5", label: "Skill Collector", desc: "Unlock 5 skills", earned: skillsUnlocked >= 5, icon: GitBranch },
    { id: "items_5", label: "Shopper", desc: "Own 5 items", earned: itemsOwned >= 5, icon: ShoppingBag },
    { id: "streak_7", label: "On Fire!", desc: "7-day streak", earned: streak >= 7, icon: Flame },
    { id: "streak_30", label: "Unstoppable", desc: "30-day streak", earned: streak >= 30, icon: Flame },
    { id: "battle_5", label: "Warrior", desc: "Win 5 battles", earned: battlesWon >= 5, icon: Swords },
  ];
}

function getStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("eduverse_streak");
    if (!raw) return 0;
    const { count } = JSON.parse(raw);
    return count || 0;
  } catch { return 0; }
}

function getActivityData(xpLogs: { createdAt: string; amount: number }[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const log of xpLogs || []) {
    const day = new Date(log.createdAt).toISOString().split("T")[0];
    map[day] = (map[day] || 0) + log.amount;
  }
  return map;
}

function getLast12Weeks() {
  const days: { date: string; label: string }[] = [];
  const now = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().split("T")[0], label: d.toLocaleDateString("en-US", { weekday: "short" }) });
  }
  return days;
}

function getXpBreakdown(xpLogs: { amount: number; source: string }[]) {
  const breakdown: Record<string, number> = {};
  for (const log of xpLogs || []) {
    breakdown[log.source] = (breakdown[log.source] || 0) + log.amount;
  }
  return breakdown;
}

function getCourseProgress(progress: { completed: boolean; lesson: { courseId: string } }[]) {
  const courseMap: Record<string, { total: number; done: number }> = {};
  for (const p of progress || []) {
    const cid = p.lesson.courseId;
    if (!courseMap[cid]) courseMap[cid] = { total: 0, done: 0 };
    courseMap[cid].total++;
    if (p.completed) courseMap[cid].done++;
  }
  return courseMap;
}

export default function ProfilePage() {
  const { user, updateXp, setUser } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);

  // Avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const streak = useMemo(() => getStreak(), [profile]);
  const activityData = useMemo(() => getActivityData(profile?.xpLogs || []), [profile]);
  const days12Weeks = useMemo(() => getLast12Weeks(), []);
  const maxActivity = Math.max(...Object.values(activityData), 1);
  const xpBreakdown = useMemo(() => getXpBreakdown(profile?.xpLogs || []), [profile]);
  const courseProgress = useMemo(() => getCourseProgress(profile?.progress || []), [profile]);
  const achievements = useMemo(() => getAchievements(profile as ProfileData, streak), [profile, streak]);
  const totalXpEarned = useMemo(() => profile?.xpLogs?.reduce((s, l) => s + l.amount, 0) || 0, [profile]);

  const earnedAchievements = achievements.filter(a => a.earned);

  useEffect(() => {
    api.getProfile().then((res) => {
      setProfile(res.data);
      setEditUsername(res.data.username);
      setEditBio(res.data.bio || "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      try {
        const res = await api.updateProfile({ avatar: dataUrl });
        setProfile(res.data);
        setUser(res.data);
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  const handleStartEdit = () => {
    setEditUsername(profile?.username || "");
    setEditBio(profile?.bio || "");
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditUsername(profile?.username || "");
    setEditBio(profile?.bio || "");
    setEditing(false);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await api.updateProfile({ username: editUsername, bio: editBio });
      setProfile(res.data);
      setUser(res.data);
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  const activityColor = (amount: number) => {
    if (amount === 0) return "bg-white/[0.03]";
    const intensity = Math.min(1, amount / maxActivity);
    if (intensity < 0.25) return "bg-eduverse-accent/20";
    if (intensity < 0.5) return "bg-eduverse-accent/35";
    if (intensity < 0.75) return "bg-eduverse-accent/55";
    return "bg-eduverse-accent/80";
  };

  const sourceIcons: Record<string, any> = {
    lesson: BookOpen,
    battle: Swords,
    challenge: Target,
  };
  const sourceColors: Record<string, string> = {
    lesson: "text-eduverse-success",
    battle: "text-eduverse-danger",
    challenge: "text-eduverse-warning",
  };
  const sourceBarColors: Record<string, string> = {
    lesson: "bg-eduverse-success",
    battle: "bg-eduverse-danger",
    challenge: "bg-eduverse-warning",
  };

  const SourceIcon = (source: string) => {
    const Icon = sourceIcons[source] || Zap;
    return <Icon className="w-3.5 h-3.5" />;
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="space-y-6 w-full max-w-4xl">
          <div className="h-40 rounded-2xl bg-white/[0.03] animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-white/[0.03] animate-pulse" />)}
          </div>
          <div className="h-64 rounded-2xl bg-white/[0.03] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* ── Profile Header ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-eduverse-accent/5 to-transparent pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-eduverse-accent to-purple-600 flex items-center justify-center text-4xl font-bold overflow-hidden ring-2 ring-white/10 group-hover:ring-eduverse-accent/50 transition-all duration-300">
                {avatarPreview || profile.avatar?.startsWith("data:") ? (
                  <img src={avatarPreview || profile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.username[0].toUpperCase()
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 w-full">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-eduverse-accent outline-none text-lg font-bold font-display"
                    placeholder="Username"
                  />
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-eduverse-accent outline-none text-sm resize-none"
                    rows={3}
                    placeholder="Write something about yourself..."
                  />
                  <div className="flex gap-2">
                    <GradientButton onClick={handleSaveEdit} disabled={saving} className="text-xs py-2">
                      {saving ? "Saving..." : "Save"}
                    </GradientButton>
                    <GradientButton onClick={handleCancelEdit} variant="ghost" className="text-xs py-2">Cancel</GradientButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold font-display">{profile.username}</h1>
                    <button onClick={handleStartEdit} className="text-xs text-eduverse-text-muted hover:text-white px-2 py-1 rounded-lg bg-white/5 flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${tierBadgeColors[profile.placementLevel] || "bg-eduverse-accent/20 text-eduverse-accent-light"}`}>
                      {profile.placementLevel}
                    </span>
                  </div>
                  <p className="text-sm text-eduverse-text-muted mt-1.5 max-w-lg leading-relaxed">
                    {profile.bio || "No bio yet. Click edit to add one."}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-eduverse-text-muted flex-wrap">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {profile.email}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                    <span className="flex items-center gap-1.5"><Medal className="w-3.5 h-3.5" /> Rank #{profile.rank || "—"}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── XP & Level ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold font-display flex items-center gap-2">
              <Zap className="w-5 h-5 text-eduverse-warning" />
              Level {profile.level} &mdash; {profile.xp.toLocaleString()} Total XP
            </h2>
            <span className="text-xs text-eduverse-text-muted">
              {totalXpEarned.toLocaleString()} XP earned all time
            </span>
          </div>
          <XpBar xp={profile.xp} size="lg" />
        </GlassCard>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Level", value: profile.level, icon: TrendingUp, color: "text-eduverse-accent-light" },
          { label: "Total XP", value: profile.xp.toLocaleString(), icon: Zap, color: "text-eduverse-warning" },
          { label: "Lessons Done", value: profile.progress?.filter(p => p.completed).length || 0, icon: BookOpen, color: "text-eduverse-success" },
          { label: "Skills Unlocked", value: profile.skills?.filter(s => s.unlocked).length || 0, icon: GitBranch, color: "text-blue-400" },
          { label: "Items Owned", value: profile.inventory?.length || 0, icon: ShoppingBag, color: "text-pink-400" },
          { label: "Rank", value: `#${profile.rank || "—"}`, icon: Medal, color: "text-eduverse-gold" },
          { label: "Streak", value: `${streak} days`, icon: Flame, color: streak >= 7 ? "text-orange-400" : "text-eduverse-text-muted" },
          { label: "Battles", value: "—", icon: Swords, color: "text-eduverse-danger" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 + i * 0.03 }}
          >
            <GlassCard className="text-center p-5" hover={false}>
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
              <div className="text-xl font-bold font-display">{stat.value}</div>
              <div className="text-xs text-eduverse-text-muted mt-0.5">{stat.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* ── Two column: Activity Heatmap + XP Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity Heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard>
            <h2 className="text-sm font-bold font-display mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-eduverse-accent-light" />
              Activity (Last 12 Weeks)
            </h2>
            <div className="flex gap-0.5 flex-wrap">
              {days12Weeks.map((day, i) => {
                const amount = activityData[day.date] || 0;
                return (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm ${activityColor(amount)}`}
                    title={`${day.date}: ${amount} XP`}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-eduverse-text-muted">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-white/[0.03]" />
              <div className="w-3 h-3 rounded-sm bg-eduverse-accent/20" />
              <div className="w-3 h-3 rounded-sm bg-eduverse-accent/35" />
              <div className="w-3 h-3 rounded-sm bg-eduverse-accent/55" />
              <div className="w-3 h-3 rounded-sm bg-eduverse-accent/80" />
              <span>More</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* XP Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard>
            <h2 className="text-sm font-bold font-display mb-4 flex items-center gap-2">
              <PieChartIcon />
              XP Breakdown
            </h2>
            {Object.keys(xpBreakdown).length === 0 ? (
              <p className="text-sm text-eduverse-text-muted">No XP history yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(xpBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, amount]) => {
                    const totalXp = Object.values(xpBreakdown).reduce((s, v) => s + v, 0);
                    const pct = Math.round((amount / totalXp) * 100);
                    const Icon = sourceIcons[source] || Zap;
                    return (
                      <div key={source}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className={`flex items-center gap-1.5 capitalize ${sourceColors[source] || "text-eduverse-text-muted"}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {source}
                          </span>
                          <span className="font-semibold">{amount.toLocaleString()} XP ({pct}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${sourceBarColors[source] || "bg-eduverse-accent"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Course Progress ── */}
      {Object.keys(courseProgress).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassCard>
            <h2 className="text-sm font-bold font-display mb-4 flex items-center gap-2">
              <Layers className="w-4 h-5 text-eduverse-success" />
              Course Progress
            </h2>
            <div className="space-y-3">
              {Object.entries(courseProgress).map(([courseId, { total, done }]) => {
                const pct = Math.round((done / total) * 100);
                const courseName = profile.progress?.find(p => p.lesson.courseId === courseId)?.lesson.title?.split(" ")[0] || "Course";
                return (
                  <div key={courseId}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium truncate mr-2">{courseName}</span>
                      <span className="text-xs text-eduverse-text-muted whitespace-nowrap">{done}/{total} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-eduverse-accent to-eduverse-accent-light"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ── Achievements ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard>
          <h2 className="text-sm font-bold font-display mb-4 flex items-center gap-2">
            <Award className="w-4 h-5 text-eduverse-gold" />
            Achievements
            <span className="text-xs text-eduverse-text-muted font-normal ml-1">
              ({earnedAchievements.length}/{achievements.length})
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {achievements.map((ach) => {
              const Icon = ach.icon;
              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    ach.earned
                      ? "bg-eduverse-accent/5 border-eduverse-accent/20"
                      : "bg-white/[0.02] border-white/[0.05] opacity-40"
                  }`}
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1.5 ${ach.earned ? "text-eduverse-gold" : "text-eduverse-text-muted"}`} />
                  <div className="text-xs font-semibold">{ach.label}</div>
                  <div className="text-[10px] text-eduverse-text-muted mt-0.5 leading-tight">{ach.desc}</div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Equipped Items ── */}
      {profile.inventory?.filter(i => i.equipped).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard>
            <h2 className="text-sm font-bold font-display mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-5 text-eduverse-accent-light" />
              Equipped Items
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {profile.inventory?.filter(i => i.equipped).map((inv) => (
                <div key={inv.itemId} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-lg bg-eduverse-accent/10 flex items-center justify-center text-sm">
                    {inv.item.imageUrl ? (
                      <img src={inv.item.imageUrl} alt="" className="w-6 h-6" />
                    ) : (
                      <Star className="w-4 h-4 text-eduverse-accent-light" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{inv.item.name}</div>
                    <div className="text-[10px] text-eduverse-text-muted capitalize">{inv.item.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ── Recent XP Gains ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <GlassCard>
          <h2 className="text-sm font-bold font-display mb-4 flex items-center gap-2">
            <Zap className="w-4 h-5 text-eduverse-warning" />
            Recent XP Gains
          </h2>
          <div className="space-y-1">
            {profile.xpLogs?.slice(0, 20).map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`capitalize flex items-center gap-1.5 ${sourceColors[log.source] || "text-eduverse-text-muted"}`}>
                    {SourceIcon(log.source)}
                    {log.source}
                  </span>
                  <span className="text-xs text-eduverse-text-muted">
                    {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <span className="font-bold text-eduverse-success text-sm">+{log.amount} XP</span>
              </motion.div>
            )) || <p className="text-sm text-eduverse-text-muted py-4 text-center">No XP history yet. Start coding!</p>}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function PieChartIcon() {
  return (
    <svg className="w-4 h-5 text-eduverse-accent-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
