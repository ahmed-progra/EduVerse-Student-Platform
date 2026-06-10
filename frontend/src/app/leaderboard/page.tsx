"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { Medal, Trophy, Search, Crown, WifiOff } from "lucide-react";

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

  useEffect(() => { loadLeaderboard(); }, [period]);

  const filtered = search
    ? entries.filter((e) => e.username.toLowerCase().includes(search.toLowerCase()))
    : entries;

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "text-eduverse-gold";
    if (rank === 2) return "text-eduverse-silver";
    if (rank === 3) return "text-eduverse-bronze";
    return "text-eduverse-text-muted";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-eduverse-gold" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-eduverse-silver" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-eduverse-bronze" />;
    return null;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-eduverse-gold" />
          Leaderboard
        </h1>
        <p className="text-eduverse-text-muted">Top programmers ranked by XP.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-eduverse-text-muted" />
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search by username"
            className="app-input !pl-10 !py-2 text-sm"
          />
        </div>
      </div>

      {/* My Rank */}
      {myRank && myRank.rank > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="flex items-center justify-between border-eduverse-accent/30">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-eduverse-accent-light">#{myRank.rank}</div>
              <div>
                <div className="font-semibold">Your Rank</div>
                <div className="text-sm text-eduverse-text-muted">{myRank.score} XP</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Podium */}
      {filtered.length >= 3 && !search && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {[1, 0, 2].map((i) => {
            const e = filtered[i];
            if (!e) return null;
            const heights = ["h-24", "h-32", "h-20"];
            const medals = ["text-eduverse-silver", "text-eduverse-gold", "text-eduverse-bronze"];
            return (
              <motion.div
                key={e.rank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center"
              >
                <Trophy className={`w-8 h-8 ${medals[i]}`} />
                <div className="text-sm font-bold mb-1">{e.username}</div>
                <div className="text-xs text-eduverse-text-muted mb-2">{e.xp} XP</div>
                <div className={`w-20 ${heights[i]} glass rounded-t-xl flex items-center justify-center`}>
                  <span className="text-2xl font-bold">#{e.rank}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List */}
      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3 animate-pulse" aria-hidden="true">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-12 rounded-xl bg-eduverse-raised" />)}
          </div>
        ) : offline ? (
          <div className="p-6">
            <EmptyState icon={WifiOff} title="Can't reach the server" message="The EduVerse API isn't responding, so rankings can't be loaded." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Trophy} title={search ? "No matching players" : "No rankings yet"} message={search ? "Nobody on the board matches that name." : "Be the first on the board: complete a lesson or win a battle to earn XP."} />
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="grid grid-cols-[60px_1fr_80px_100px] gap-4 p-4 border-b border-white/10 text-sm text-eduverse-text-muted font-semibold">
              <div>Rank</div>
              <div>User</div>
              <div>Level</div>
              <div className="text-right">XP</div>
            </div>
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`grid grid-cols-[60px_1fr_80px_100px] gap-4 p-4 border-b border-white/5 last:border-0 items-center hover:bg-white/5 transition-colors ${entry.userId === user?.id ? "bg-eduverse-accent-soft" : ""}`}
              >
                <div className={`flex items-center gap-1 font-bold ${getRankStyle(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                  #{entry.rank}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-eduverse-accent/30 flex items-center justify-center text-sm font-bold">
                    {entry.username[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">{entry.username}</span>
                </div>
                <div className="text-sm text-eduverse-accent-light">{entry.level}</div>
                <div className="text-right font-mono text-sm">{entry.xp.toLocaleString()}</div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
