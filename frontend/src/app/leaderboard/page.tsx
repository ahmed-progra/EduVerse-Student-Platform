"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonRow, SkeletonPodium } from "@/components/ui/skeleton";
import { api } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { fadeUp, staggerContainer, fastEaseTransition } from "@/lib/motion";
import { useEffect, useState } from "react";
import { Search, Crown, WifiOff, Trophy, Medal } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  level: number;
  rank: number;
  userId: string;
}

interface RankInfo {
  rank: number;
  score: number;
}

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [myRank, setMyRank] = useState<RankInfo | null>(null);
  const [search, setSearch] = useState("");

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const [lbRes, rankRes] = await Promise.all([
        api.getLeaderboard({ period, limit: 100 }),
        api.getRank().catch(() => ({ data: null })),
      ]);
      setEntries(lbRes.data.entries);
      setMyRank(rankRes.data);
      setOffline(false);
    } catch {
      setOffline(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const filtered = search
    ? entries.filter((e) => e.username.toLowerCase().includes(search.toLowerCase()))
    : entries;

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "text-eduverse-gold";
    if (rank === 2) return "text-eduverse-silver";
    if (rank === 3) return "text-eduverse-bronze";
    return "text-eduverse-text-muted";
  };

  const getRankLabel = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 inline" aria-label="Rank 1" />;
    if (rank === 2) return <Medal className="w-4 h-4 inline" aria-label="Rank 2" />;
    if (rank === 3) return <Medal className="w-4 h-4 inline" aria-label="Rank 3" />;
    return `#${rank}`;
  };

  return (
    <motion.div
      className="space-y-8 max-w-4xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUp} transition={fastEaseTransition}>
        <h1 className="text-3xl font-bold mb-2 font-display tracking-tight">Leaderboard</h1>
        <p className="text-eduverse-text-muted">Top programmers ranked by XP earned.</p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.05 }}>
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex gap-2">
            {["all", "weekly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                aria-pressed={period === p}
                className={`seg-btn ${period === p ? "active" : ""}`}
              >
                {p === "all" ? "All Time" : "Weekly"}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-eduverse-text-muted"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search by username"
              className="app-input pl-9 py-2 text-sm"
            />
          </div>
        </div>
      </motion.div>

      {myRank && myRank.rank > 0 && (
        <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.08 }}>
          <div className="section-label">
            <span className="section-label-prefix">//</span> My Rank
          </div>
          <GlassCard
            className="flex items-center justify-between border-eduverse-accent/30"
            style={{ borderColor: "oklch(78% 0.14 85 / 0.3)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "var(--color-eduverse-accent-soft)" }}
              >
                <Medal className="w-5 h-5 text-eduverse-accent" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs text-eduverse-text-muted font-mono mb-0.5">Your Rank</div>
                <div className="text-2xl font-bold text-eduverse-accent-light font-mono tracking-tight">
                  #{myRank.rank}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-eduverse-text-muted font-mono mb-0.5">Total XP</div>
              <div className="font-bold font-mono text-lg text-eduverse-text">
                {myRank.score.toLocaleString()}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Podium */}
      {!loading && !offline && filtered.length >= 3 && !search && (
        <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.12 }}>
          <div className="section-label">
            <span className="section-label-prefix">//</span> Podium
          </div>
          <GlassCard className="overflow-hidden p-0 pb-0">
            <div className="podium-wrap">
              {[1, 0, 2].map((idx) => {
                const e = filtered[idx];
                if (!e) return null;
                const rankClass = [`rank-2`, `rank-1`, `rank-3`][idx];
                const delays = [0.15, 0, 0.25];
                return (
                  <motion.div
                    key={e.rank}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delays[idx], duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="podium-col"
                  >
                    <div className={`podium-avatar ${rankClass}`}>
                      {e.username[0].toUpperCase()}
                    </div>
                    <div className="podium-name">{e.username}</div>
                    <div className="podium-xp">{e.xp.toLocaleString()} XP</div>
                    <div className={`podium-pedestal ${rankClass}`}>
                      {e.rank === 1 ? (
                        <Crown className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <Medal className="w-5 h-5" aria-hidden="true" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {loading && !search && <SkeletonPodium />}

      {/* Rankings List */}
      <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.16 }}>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Rankings
        </div>
        <GlassCard className="p-0 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-white/[0.04]" aria-hidden="true">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="px-4">
                  <SkeletonRow />
                </div>
              ))}
            </div>
          ) : offline ? (
            <div className="p-8">
              <EmptyState
                icon={WifiOff}
                title="Can't reach the server"
                message="The EduVerse API isn't responding, so rankings can't be loaded."
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Trophy}
                title={search ? "No matching players" : "No rankings yet"}
                message={
                  search
                    ? "Nobody on the board matches that name."
                    : "Be the first on the board: complete a lesson or win a battle to earn XP."
                }
              />
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-[64px_1fr_72px_100px] gap-2 md:gap-4 px-5 py-3 border-b border-white/[0.06] text-xs text-eduverse-text-muted font-mono uppercase tracking-wider">
                <div>Rank</div>
                <div>Player</div>
                <div>Level</div>
                <div className="text-right">XP</div>
              </div>
              {filtered.map((entry, i) => {
                const isMe = entry.userId === user?.id;
                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.025, 0.4) }}
                    className={`grid grid-cols-1 md:grid-cols-[64px_1fr_72px_100px] gap-2 md:gap-4 px-5 py-4 border-b border-white/[0.03] last:border-0 items-center transition-all ${
                      isMe
                        ? "bg-eduverse-accent-soft border-l-2 border-l-eduverse-accent"
                        : "hover:bg-white/[0.02]"
                    }`}
                    style={isMe ? { borderLeft: "2px solid var(--color-eduverse-accent)" } : {}}
                  >
                    <div className={`font-bold font-mono text-sm ${getRankStyle(entry.rank)}`}>
                      {getRankLabel(entry.rank)}
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold font-mono"
                        style={{
                          background: isMe
                            ? "var(--color-eduverse-accent-strong)"
                            : "var(--color-eduverse-raised)",
                          color: isMe
                            ? "var(--color-eduverse-bg)"
                            : "var(--color-eduverse-text-muted)",
                        }}
                      >
                        {entry.username[0].toUpperCase()}
                      </div>
                      <span
                        className={`font-medium text-sm truncate ${isMe ? "text-eduverse-accent" : "text-eduverse-text"}`}
                      >
                        {entry.username}
                        {isMe && (
                          <span className="ml-2 text-[10px] opacity-70 font-mono">(you)</span>
                        )}
                      </span>
                    </div>
                    <div className="text-sm font-mono text-eduverse-accent">{entry.level}</div>
                    <div className="text-right font-mono text-sm text-eduverse-text">
                      {entry.xp.toLocaleString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
