"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Swords, Clock, Play, Trophy, History } from "lucide-react";

interface BattleChallenge {
  title: string;
  description: string;
  starterCode: string;
  type: string;
}

interface BattleResult {
  winnerId: string | null;
  xpReward: number;
}

interface BattleEntry {
  id: string;
  difficulty: string;
  timeLimit: number;
  winnerId: string | null;
}

export default function BattlePage() {
  const { user, updateXp } = useAuthStore();
  const [view, setView] = useState<"lobby" | "arena" | "history">("lobby");
  const [difficulty, setDifficulty] = useState("easy");
  const [timeLimit, setTimeLimit] = useState(180);
  const [battle, setBattle] = useState<BattleEntry | null>(null);
  const [challenge, setChallenge] = useState<BattleChallenge | null>(null);
  const [code, setCode] = useState("");
  const codeRef = useRef(code);
  const [output, setOutput] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<BattleEntry[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    api.getBattleHistory().then((res) => setHistory(res.data)).catch(() => {});
  }, []);

  const handleCreateBattle = async () => {
    setLoading(true);
    try {
      const res = await api.createBattle({ difficulty, timeLimit });
      const b = res.data;
      const c = JSON.parse(b.challenge);
      setBattle(b);
      setChallenge(c);
      setCode(c.starterCode);
      codeRef.current = c.starterCode;
      setTimeLeft(timeLimit);
      setSubmitted(false);
      setResult(null);
      setOutput("");
      setView("arena");
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit(b.id, codeRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const handleRun = async () => {
    setOutput("Running...");
    try {
      const res = await api.executeCode({ code, language: "python" });
      const d = res.data;
      setOutput(d.stdout || d.stderr || d.error || "(no output)");
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleSubmit = async (battleId: string, submittedCode: string) => {
    if (submitted) return;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTakenMs = Date.now() - startTimeRef.current;
    const timeLimitMs = timeLimit * 1000;

    try {
      const res = await api.submitBattle({
        battleId,
        code: submittedCode,
        timeTakenMs,
        timeLimitMs,
      });
      setResult(res.data);
      if (res.data.xpReward > 0 && user) {
        const profile = await api.getProfile();
        updateXp(profile.data.xp, profile.data.level);
      }
    } catch {}
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Swords className="w-8 h-8 text-eduverse-accent-light" />
          Battle Arena
        </h1>
        <p className="text-eduverse-text-muted">Test your skills against coding challenges.</p>
      </motion.div>

      {view === "lobby" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard>
            <h2 className="text-xl font-bold mb-6">Configure Battle</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Difficulty</label>
                <div className="flex gap-3">
                  {["easy", "medium", "hard"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      aria-pressed={difficulty === d}
                      className={`seg-btn ${difficulty === d ? "active" : ""}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">Time Limit</label>
                <div className="flex gap-3">
                  {[
                    { label: "3 min", value: 180 },
                    { label: "5 min", value: 300 },
                    { label: "10 min", value: 600 },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTimeLimit(t.value)}
                      aria-pressed={timeLimit === t.value}
                      className={`seg-btn ${timeLimit === t.value ? "active" : ""}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <GradientButton onClick={handleCreateBattle} loading={loading} className="w-full">
                <Play className="w-4 h-4" /> Start Battle
              </GradientButton>
            </div>
          </GlassCard>

          {/* History */}
          {history.length > 0 && (
            <GlassCard className="mt-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <History className="w-5 h-5" /> Battle History
              </h2>
              <div className="space-y-2">
                {history.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-white/5 text-sm">
                    <div>
                      <span className="capitalize">{b.difficulty}</span>
                      <span className="text-eduverse-text-muted ml-2">{b.timeLimit}s</span>
                    </div>
                    <div className={b.winnerId === user?.id ? "text-eduverse-success font-semibold" : b.winnerId ? "text-eduverse-danger font-semibold" : "text-eduverse-text-muted font-semibold"}>
                      {b.winnerId === user?.id ? "Won" : b.winnerId ? "Lost" : "Draw"}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </motion.div>
      )}

      {view === "arena" && challenge && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Timer & Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-bold font-mono ${timeLeft < 30 ? "text-eduverse-danger animate-pulse" : "text-eduverse-accent-light"}`}>
                <Clock className="w-5 h-5 inline mr-2" />
                {formatTime(timeLeft)}
              </div>
              <span className="text-sm capitalize text-eduverse-text-muted">{challenge.type.replace("_", " ")}</span>
            </div>
            <GradientButton
              onClick={() => battle && handleSubmit(battle.id, code)}
              disabled={submitted}
              variant="danger"
            >
              Submit
            </GradientButton>
          </div>

          {/* Challenge Description */}
          <GlassCard>
            <h2 className="font-bold mb-2">{challenge.title}</h2>
            <p className="text-sm text-eduverse-text-muted">{challenge.description}</p>
          </GlassCard>

          {/* Editor */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-3 border-b border-white/10 text-sm font-semibold">Code Editor</div>
            <Editor
              height="350px"
              language="python"
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                readOnly: submitted,
              }}
            />
          </GlassCard>

          {/* Run & Output */}
          {!submitted && (
            <GradientButton onClick={handleRun} className="flex items-center gap-2">
              <Play className="w-4 h-4" /> Run
            </GradientButton>
          )}

          {output && (
            <GlassCard>
              <h3 className="font-semibold mb-2">Output</h3>
              <pre className="bg-black/30 rounded-xl p-4 text-sm font-mono overflow-auto">{output}</pre>
            </GlassCard>
          )}

          {/* Result */}
          {result && (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <GlassCard glow className="text-center py-8">
                <Trophy className={`w-16 h-16 mx-auto mb-4 ${result.winnerId === user?.id ? "text-eduverse-gold" : "text-eduverse-text-muted"}`} />
                <h2 className="text-2xl font-bold mb-2">
                  {result.winnerId === user?.id ? "Victory!" : result.winnerId ? "Defeat" : "Draw"}
                </h2>
                {result.xpReward > 0 && (
                  <p className="text-eduverse-success font-bold">+{result.xpReward} XP</p>
                )}
                <GradientButton onClick={() => setView("lobby")} className="mt-4">
                  Back to Lobby
                </GradientButton>
              </GlassCard>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
