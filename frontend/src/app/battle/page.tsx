"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { EmptyState } from "@/components/ui/empty-state";
import { Confetti } from "@/components/ui/confetti";
import { api } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { fadeUp, staggerContainer, fastEaseTransition } from "@/lib/motion";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Swords,
  Clock,
  Play,
  Trophy,
  History,
  ShieldAlert,
  Scale,
  AlertCircle,
} from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] bg-eduverse-editor animate-pulse" aria-label="Loading code editor" />
  ),
});

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
  const [view, setView] = useState<"lobby" | "staging" | "arena">("lobby");
  const [difficulty, setDifficulty] = useState("easy");
  const [timeLimit, setTimeLimit] = useState(180);
  const [battle, setBattle] = useState<BattleEntry | null>(null);
  const [challenge, setChallenge] = useState<BattleChallenge | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [code, setCode] = useState("");
  const codeRef = useRef(code);
  const [output, setOutput] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<BattleEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [battleError, setBattleError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    api
      .getBattleHistory()
      .then((res) => setHistory(res.data))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const handleCreateBattle = async () => {
    setLoading(true);
    setBattleError(null);
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
      // staging: reveal the challenge, count down, then the clock starts
      setCountdown(3);
      setView("staging");
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            enterArena(b);
            return 0;
          }
          return prev - 1;
        });
      }, 900);
    } catch (err) {
      setBattleError(err instanceof Error ? err.message : "Couldn't start the battle. Try again.");
    }
    setLoading(false);
  };

  const enterArena = (b: BattleEntry) => {
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
  };

  const skipCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (battle) enterArena(battle);
  };

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
      api
        .getBattleHistory()
        .then((r) => setHistory(r.data))
        .catch(() => {});
    } catch (err) {
      // Let the learner retry: re-open the editor and surface what went wrong.
      setSubmitted(false);
      setBattleError(
        err instanceof Error ? err.message : "Couldn't submit your solution. Try again.",
      );
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const timeFraction = timeLimit > 0 ? timeLeft / timeLimit : 0;
  const verdict = result
    ? result.winnerId === user?.id
      ? "victory"
      : result.winnerId
        ? "defeat"
        : "draw"
    : null;

  // One-shot victory confetti — keyed on the verdict so the running arena timer
  // (which re-renders every second) can't re-roll the burst mid-fall.
  const [victoryBurst, setVictoryBurst] = useState(false);
  useEffect(() => {
    if (verdict === "victory") {
      setVictoryBurst(true);
      const t = setTimeout(() => setVictoryBurst(false), 2400);
      return () => clearTimeout(t);
    }
  }, [verdict]);

  return (
    <motion.div
      className="space-y-6 max-w-6xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <AnimatePresence>
        {battleError && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeOut" } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="xp-toast"
            role="alert"
          >
            <AlertCircle className="w-6 h-6 text-eduverse-danger" aria-hidden="true" />
            <div className="flex-1">
              <div className="font-bold text-eduverse-text">Something went wrong</div>
              <div className="text-xs text-eduverse-text-muted">{battleError}</div>
            </div>
            <button
              onClick={() => setBattleError(null)}
              className="text-xs underline opacity-70 hover:opacity-100 transition-opacity"
            >
              dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div variants={fadeUp} transition={fastEaseTransition}>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Arena
        </div>
        <h1 className="text-3xl font-bold mb-2 font-display flex items-center gap-3 tracking-tight">
          <Swords className="w-7 h-7 text-eduverse-accent" aria-hidden="true" />
          Battle Arena
        </h1>
        <p className="text-eduverse-text-muted">
          You against the clock. Solve it before the sand runs out.
        </p>
      </motion.div>

      {view === "lobby" && (
        <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.05 }}>
          <GlassCard>
            <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted mb-6">
              <span className="text-eduverse-accent">{"//"}</span> Configure Battle
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Difficulty</label>
                <div className="flex gap-3 flex-wrap">
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
                <div className="flex gap-3 flex-wrap">
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
                <Play className="w-4 h-4" aria-hidden="true" /> Start Battle
              </GradientButton>
            </div>
          </GlassCard>

          <GlassCard className="mt-6">
            <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted mb-4">
              <History className="w-4 h-4" aria-hidden="true" /> Battle History
            </h2>
            {historyLoading ? (
              <div className="space-y-2" aria-label="Loading battle history">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="sk-card" style={{ height: "36px" }} />
                ))}
              </div>
            ) : history.length === 0 ? (
              <EmptyState
                icon={Swords}
                title="No battles yet"
                message="Create a battle above and race the clock — every win and loss lands here."
              />
            ) : (
              <div className="space-y-2">
                {history.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between py-2 border-b border-eduverse-border last:border-0 text-sm"
                  >
                    <div className="font-mono text-xs">
                      <span className="capitalize text-eduverse-text-body">{b.difficulty}</span>
                      <span className="text-eduverse-text-muted ml-2">{b.timeLimit}s</span>
                    </div>
                    <div
                      className={`font-semibold ${b.winnerId === user?.id ? "text-eduverse-success" : b.winnerId ? "text-eduverse-danger" : "text-eduverse-text-muted"}`}
                    >
                      {b.winnerId === user?.id ? "Won" : b.winnerId ? "Lost" : "Draw"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* ── Staging: the summoning ── */}
      {view === "staging" && challenge && (
        <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.1 }}>
          <div className="battle-staging">
            <div className="bt-meta font-mono">
              <span className="capitalize">{difficulty}</span> · {formatTime(timeLimit)} ·{" "}
              {challenge.type.replace("_", " ")}
            </div>
            <h2 className="bt-title font-display">{challenge.title}</h2>
            <p className="bt-desc">{challenge.description}</p>
            <div className="bt-vs font-mono" aria-hidden="true">
              <span>{user?.username || "you"}</span>
              <Swords className="w-4 h-4 text-eduverse-accent" />
              <span>the clock</span>
            </div>
            <div
              key={countdown}
              className="bt-count font-mono"
              role="timer"
              aria-label={`Battle starts in ${countdown}`}
            >
              {countdown}
            </div>
            <button className="bt-skip font-mono" onClick={skipCountdown}>
              skip →
            </button>
          </div>
        </motion.div>
      )}

      {view === "arena" && challenge && (
        <motion.div
          variants={fadeUp}
          transition={{ ...fastEaseTransition, delay: 0.15 }}
          className="space-y-4"
        >
          {/* Timer & status */}
          <div className="bt-timer-row">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`bt-clock font-mono ${timeLeft < 30 && !submitted ? "danger" : ""}`}
                role="timer"
                aria-label={`${formatTime(timeLeft)} remaining`}
              >
                <Clock className="w-5 h-5 inline mr-2 -mt-1" aria-hidden="true" />
                {formatTime(timeLeft)}
              </div>
              <span className="text-sm capitalize text-eduverse-text-muted truncate">
                {challenge.type.replace("_", " ")}
              </span>
            </div>
            <GradientButton
              onClick={() => battle && handleSubmit(battle.id, code)}
              disabled={submitted}
            >
              Submit
            </GradientButton>
          </div>
          <div className="bt-timebar" aria-hidden="true">
            <div
              className={`bt-timebar-fill ${timeLeft < 30 && !submitted ? "danger" : ""}`}
              style={{ transform: `scaleX(${timeFraction})` }}
            />
          </div>

          {/* Challenge */}
          <GlassCard>
            <h2 className="font-bold mb-2 font-display">{challenge.title}</h2>
            <p className="text-sm text-eduverse-text-muted leading-relaxed">
              {challenge.description}
            </p>
          </GlassCard>

          {/* Editor */}
          <GlassCard className="!p-0 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-eduverse-border text-xs font-mono text-eduverse-text-muted">
              <span className="text-eduverse-accent">{"//"}</span> solution.py
            </div>
            <Editor
              height="350px"
              language="python"
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'IBM Plex Mono', monospace",
                readOnly: submitted,
              }}
            />
          </GlassCard>

          {!submitted && (
            <GradientButton onClick={handleRun} variant="ghost">
              <Play className="w-4 h-4" aria-hidden="true" /> Run
            </GradientButton>
          )}

          {output && (
            <GlassCard>
              <h3 className="text-xs font-mono text-eduverse-text-muted mb-2">
                <span className="text-eduverse-accent">{"//"}</span> Output
              </h3>
              <pre className="bg-eduverse-void/40 rounded p-4 text-sm font-mono overflow-auto">
                {output}
              </pre>
            </GlassCard>
          )}

          {/* ── Verdict ── */}
          <Confetti active={victoryBurst} count={72} />
          <AnimatePresence>
            {result && verdict && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18, ease: "easeOut" } }}
                transition={{ type: "spring", duration: 0.55, bounce: 0.25 }}
              >
                <GlassCard className="text-center py-10 relative overflow-hidden">
                  <div className="bt-verdict-icon" data-verdict={verdict}>
                    <span className="bt-verdict-burst" aria-hidden="true" />
                    {verdict === "victory" ? (
                      <Trophy className="w-10 h-10" aria-hidden="true" />
                    ) : verdict === "defeat" ? (
                      <ShieldAlert className="w-10 h-10" aria-hidden="true" />
                    ) : (
                      <Scale className="w-10 h-10" aria-hidden="true" />
                    )}
                  </div>
                  <h2 className="text-4xl font-bold mb-1 font-display capitalize">{verdict}</h2>
                  <p className="text-sm text-eduverse-text-muted font-mono mb-3">
                    {verdict === "victory"
                      ? "the clock yields"
                      : verdict === "defeat"
                        ? "the clock claims this one"
                        : "honors are even"}
                  </p>
                  {result.xpReward > 0 && (
                    <p className="text-eduverse-success font-bold font-mono text-lg">
                      +<AnimatedNumber value={result.xpReward} /> XP
                    </p>
                  )}
                  <GradientButton
                    onClick={() => {
                      setView("lobby");
                      setResult(null);
                    }}
                    className="mt-5"
                  >
                    Back to Lobby
                  </GradientButton>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
