"use client";

import { useState } from "react";
import { Target, Zap, CheckCircle2, RefreshCw, Hammer, Calendar, CalendarDays } from "lucide-react";
import type { Mission } from "@/lib/mentor-types";
import { api } from "@/lib/api";

interface MissionsBoardProps {
  daily: Mission[];
  weekly: Mission[];
  onChange: (data: { daily?: Mission[]; weekly?: Mission[] }) => void;
}

export function MissionsBoard({ daily, weekly, onChange }: MissionsBoardProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <MissionGroup scope="daily" label="Daily Missions" icon={Calendar} missions={daily} onChange={onChange} />
      <MissionGroup scope="weekly" label="Weekly Missions" icon={CalendarDays} missions={weekly} onChange={onChange} />
    </div>
  );
}

function MissionGroup({
  scope,
  label,
  icon: Icon,
  missions,
  onChange,
}: {
  scope: "daily" | "weekly";
  label: string;
  icon: typeof Calendar;
  missions: Mission[];
  onChange: MissionsBoardProps["onChange"];
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const regenerate = async () => {
    setBusy(true);
    setErr("");
    try {
      const res = await api.mentorGenerateMissions(scope);
      onChange(res.data);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not refresh missions.");
    } finally {
      setBusy(false);
    }
  };

  const completeProject = async (id: string) => {
    setErr("");
    try {
      await api.mentorCompleteMission(id);
      const next = missions.map((m) => (m.id === id ? { ...m, status: "completed" as const, progress: m.target } : m));
      onChange(scope === "daily" ? { daily: next } : { weekly: next });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not complete mission.");
    }
  };

  const doneCount = missions.filter((m) => m.status === "completed").length;

  return (
    <div className="app-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-eduverse-text">
          <Icon size={15} className="text-eduverse-accent" aria-hidden="true" />
          {label}
          <span className="text-xs font-mono text-eduverse-text-muted">
            {doneCount}/{missions.length}
          </span>
        </h3>
        <button
          className="ai-panel-action-btn ai-panel-action-sm ai-panel-action-ghost"
          onClick={regenerate}
          disabled={busy}
          aria-label={`Regenerate ${scope} missions`}
        >
          <RefreshCw size={12} className={busy ? "animate-spin" : ""} aria-hidden="true" /> New set
        </button>
      </div>

      <div className="space-y-2.5">
        {missions.length === 0 && <p className="text-xs text-eduverse-text-muted">No missions yet.</p>}
        {missions.map((m) => (
          <MissionCard key={m.id} mission={m} onCompleteProject={completeProject} />
        ))}
      </div>
      {err && (
        <p className="text-xs text-eduverse-text-muted mt-3" role="alert">
          Error: {err}
        </p>
      )}
    </div>
  );
}

function MissionCard({ mission, onCompleteProject }: { mission: Mission; onCompleteProject: (id: string) => void }) {
  const done = mission.status === "completed";
  const pct = Math.min(100, Math.round((mission.progress / Math.max(1, mission.target)) * 100));
  const isProject = mission.type === "project";

  return (
    <div
      className="rounded border p-3 transition-colors"
      style={{
        borderColor: done ? "var(--color-eduverse-success)" : "var(--color-eduverse-border)",
        background: done ? "var(--color-eduverse-accent-soft)" : "transparent",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-eduverse-text">
            {done ? (
              <CheckCircle2 size={14} className="text-eduverse-success shrink-0" aria-hidden="true" />
            ) : isProject ? (
              <Hammer size={14} className="text-eduverse-accent shrink-0" aria-hidden="true" />
            ) : (
              <Target size={14} className="text-eduverse-accent shrink-0" aria-hidden="true" />
            )}
            <span className="truncate">{mission.title}</span>
          </div>
          <p className="text-xs text-eduverse-text-muted mt-0.5">{mission.description}</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold font-mono text-eduverse-warning shrink-0">
          <Zap size={11} aria-hidden="true" />+{mission.xpReward}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-2.5">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-eduverse-raised">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${pct}%`, background: done ? "var(--color-eduverse-success)" : "var(--color-eduverse-accent)" }}
          />
        </div>
        <span className="text-[11px] font-mono text-eduverse-text-muted shrink-0">
          {mission.progress}/{mission.target}
        </span>
        {isProject && !done && (
          <button
            className="ai-panel-action-btn ai-panel-action-sm"
            onClick={() => onCompleteProject(mission.id)}
            aria-label="Mark project mission complete"
          >
            Mark done
          </button>
        )}
      </div>
      {mission.rationale && !done && (
        <p className="text-[11px] text-eduverse-text-muted/80 mt-2 italic">{mission.rationale}</p>
      )}
    </div>
  );
}
