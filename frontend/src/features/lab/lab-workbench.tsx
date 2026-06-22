"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Hand,
  RotateCcw,
  RotateCw,
  Grid3x3,
  Info,
  Play,
  Pause,
  Maximize2,
  Star,
  Clock,
  Gauge,
  Lightbulb,
  Globe,
  Target,
  Trophy,
} from "lucide-react";
import type { SceneHandle, ParamValues } from "./three-scene";
import { type LabSubject, type LabControl, modelDefaults, rebuildKeysOf } from "./lab-subjects";
import { LabChart } from "./lab-chart";

const FAV_KEY = "eduverse_lab_favorites";
const LAST_KEY = "eduverse_lab_last";

type LearnTab = "concepts" | "applications" | "tasks" | "challenge";

const ThreeScene = dynamic(() => import("./three-scene").then((m) => m.ThreeScene), { ssr: false });
const ModelViewer = dynamic(() => import("./model-viewer").then((m) => m.ModelViewer), {
  ssr: false,
});

function decimals(step: number) {
  if (step >= 1) return 0;
  return String(step).split(".")[1]?.length ?? 1;
}

export function LabWorkbench({ subject }: { subject: LabSubject }) {
  const { title, tagline, Icon, models } = subject;
  const searchParams = useSearchParams();
  // Deep-link: /lab/<subject>?model=<id> opens that specific model.
  const initialIdx = (() => {
    const mid = searchParams.get("model");
    const i = mid ? models.findIndex((m) => m.id === mid) : -1;
    return i >= 0 ? i : 0;
  })();
  const [activeId, setActiveId] = useState(initialIdx);
  const model = models[activeId] ?? models[0];

  const [params, setParams] = useState<ParamValues>(() => modelDefaults(model));
  const [showHints, setShowHints] = useState(true);
  const [learnTab, setLearnTab] = useState<LearnTab>("concepts");
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const handleRef = useRef<SceneHandle | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Load favourites once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavs(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  // Reset parameters + hint card + learning tab whenever the active model changes.
  useEffect(() => {
    setParams(modelDefaults(model));
    setShowHints(true);
    setLearnTab("concepts");
    // Remember the last-opened model so the hub can offer "Continue".
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify({ subject: subject.slug, model: model.id }));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const rebuildKey = useMemo(() => {
    const keys = rebuildKeysOf(model);
    return `${model.id}|${keys.map((k) => params[k]).join(",")}`;
  }, [model, params]);

  const setParam = (key: string, value: number | boolean | string) =>
    setParams((prev) => ({ ...prev, [key]: value }));

  const onReady = (h: SceneHandle) => {
    handleRef.current = h;
  };

  const resetAll = () => {
    setParams(modelDefaults(model));
    handleRef.current?.reset();
  };

  const isFav = favs.has(model.id);
  const toggleFav = () => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(model.id)) next.delete(model.id);
      else next.add(model.id);
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const toggleFullscreen = () => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  };

  const readouts = model.readouts?.(params) ?? [];
  const chart = model.chart?.(params);
  const playing = model.playKey ? params[model.playKey] !== false : false;
  const spinning = params.autoRotate !== false;
  const wireOn = !!params.wireframe;

  const learnTabs = (
    [
      {
        key: "concepts",
        label: "Concepts",
        Icon: Lightbulb,
        has: (model.concepts?.length ?? 0) > 0,
      },
      {
        key: "applications",
        label: "Real-world",
        Icon: Globe,
        has: (model.applications?.length ?? 0) > 0,
      },
      { key: "tasks", label: "Tasks", Icon: Target, has: (model.tasks?.length ?? 0) > 0 },
      { key: "challenge", label: "Challenge", Icon: Trophy, has: !!model.challenge },
    ] as const
  ).filter((t) => t.has);
  const activeLearn = learnTabs.some((t) => t.key === learnTab) ? learnTab : learnTabs[0]?.key;

  return (
    <div className="wb page-enter">
      {/* ── header ── */}
      <header className="wb-head">
        <div className="wb-head-left">
          <Link href="/lab" className="lab-back">
            <ArrowLeft size={15} aria-hidden="true" /> 3D Lab
          </Link>
          <div className="lab-head-title">
            <span className="lab-head-icon">
              <Icon size={22} aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-bold font-display tracking-tight">{title}</h1>
              <p className="text-eduverse-text-muted text-sm">{tagline}</p>
            </div>
          </div>
        </div>
        <div className="wb-head-right">
          {model.difficulty && (
            <span className={`wb-diff wb-diff-${model.difficulty.toLowerCase()}`}>
              <Gauge size={12} aria-hidden="true" /> {model.difficulty}
            </span>
          )}
          {model.estMinutes && (
            <span className="wb-time">
              <Clock size={12} aria-hidden="true" /> {model.estMinutes} min
            </span>
          )}
          <span className="wb-mode">{model.mode}</span>
          <button
            className={`wb-icon-btn ${isFav ? "active" : ""}`}
            onClick={toggleFav}
            aria-pressed={isFav}
            title={isFav ? "Remove from favourites" : "Add to favourites"}
          >
            <Star size={15} aria-hidden="true" fill={isFav ? "currentColor" : "none"} />
          </button>
          <button className="wb-icon-btn" onClick={toggleFullscreen} title="Full screen">
            <Maximize2 size={15} aria-hidden="true" />
          </button>
          <button className="wb-reset" onClick={resetAll}>
            <RotateCcw size={14} aria-hidden="true" /> Reset
          </button>
        </div>
      </header>

      {/* ── body: rail · controls · stage ── */}
      <div className="wb-body">
        {/* model rail */}
        <nav className="wb-rail" aria-label="Models">
          {models.map((m, i) => (
            <button
              key={m.id}
              className={`wb-rail-item ${i === activeId ? "active" : ""}`}
              aria-current={i === activeId}
              onClick={() => setActiveId(i)}
            >
              <span className="wb-rail-icon">
                <m.Icon size={20} aria-hidden="true" />
              </span>
              <span className="wb-rail-label">{m.name}</span>
            </button>
          ))}
        </nav>

        {/* controls column */}
        <section className="wb-controls glass-panel">
          <div>
            <h2 className="wb-model-name">{model.name}</h2>
            <p className="wb-model-tagline">{model.tagline}</p>
            <p className="wb-model-summary">{model.summary}</p>
            {model.objective && (
              <div className="wb-objective">
                <Target size={13} aria-hidden="true" />
                <span>
                  <strong>Objective:</strong> {model.objective}
                </span>
              </div>
            )}
          </div>

          {model.toolHints && model.toolHints.length > 0 && (
            <div className="wb-try">
              <div className="wb-try-head">
                <Hand size={14} aria-hidden="true" /> Try interacting
              </div>
              <ul>
                {model.toolHints.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {model.controls && model.controls.length > 0 && (
            <div className="wb-params">
              <div className="wb-params-title">Parameters</div>
              {model.controls.map((c) => (
                <ControlRow key={c.key} control={c} value={params[c.key]} onChange={setParam} />
              ))}
            </div>
          )}

          {model.playKey && (
            <button
              className={`wb-play ${playing ? "playing" : ""}`}
              onClick={() => setParam(model.playKey!, !playing)}
            >
              {playing ? (
                <Pause size={16} aria-hidden="true" />
              ) : (
                <Play size={16} aria-hidden="true" />
              )}
              {playing ? "Pause animation" : "Play animation"}
            </button>
          )}
        </section>

        {/* stage column */}
        <section className="wb-stage-col">
          <div className="wb-stage glass-panel" ref={stageRef}>
            {model.glb ? (
              <ModelViewer
                key={model.glb}
                url={model.glb}
                params={params}
                onReady={onReady}
                className="lab-canvas"
              />
            ) : (
              <ThreeScene
                init={model.init!}
                params={params}
                rebuildKey={rebuildKey}
                onReady={onReady}
                environment={model.environment}
                className="lab-canvas"
              />
            )}

            {/* floating toolbar */}
            <div className="wb-tools">
              <button
                className={`wb-tool ${spinning ? "active" : ""}`}
                title="Toggle auto-rotation"
                aria-pressed={spinning}
                onClick={() => setParam("autoRotate", !spinning)}
              >
                <RotateCw size={16} aria-hidden="true" />
                <span>Spin</span>
              </button>
              {model.supportsWireframe && (
                <button
                  className={`wb-tool ${wireOn ? "active" : ""}`}
                  title="Toggle wireframe"
                  aria-pressed={wireOn}
                  onClick={() => setParam("wireframe", !wireOn)}
                >
                  <Grid3x3 size={16} aria-hidden="true" />
                  <span>Wire</span>
                </button>
              )}
              <button className="wb-tool" title="Reset the view" onClick={resetAll}>
                <RotateCcw size={16} aria-hidden="true" />
                <span>Reset</span>
              </button>
              <button className="wb-tool" title="Full screen" onClick={toggleFullscreen}>
                <Maximize2 size={16} aria-hidden="true" />
                <span>Full</span>
              </button>
              <button
                className={`wb-tool ${showHints ? "active" : ""}`}
                title="Toggle the hint card"
                aria-pressed={showHints}
                onClick={() => setShowHints((s) => !s)}
              >
                <Info size={16} aria-hidden="true" />
                <span>Info</span>
              </button>
            </div>

            {/* hint card */}
            {showHints && model.toolHints && (
              <div className="wb-hintcard">
                <div className="wb-hintcard-head">
                  <Hand size={13} aria-hidden="true" /> Interact
                </div>
                <ul>
                  {model.toolHints.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            <span className="lab-hint">
              <Hand size={13} aria-hidden="true" /> Drag to orbit · scroll to zoom
            </span>
          </div>

          {/* live simulation graph */}
          {chart && <LabChart data={chart} />}

          {/* result cards */}
          {readouts.length > 0 && (
            <div className="wb-readouts">
              {readouts.map((r) => (
                <div key={r.label} className="wb-readout">
                  <span className="wb-readout-label">{r.label}</span>
                  <span className="wb-readout-value">{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── explanation ── */}
      <section className="wb-explain glass-panel">
        <div className="section-label" style={{ marginBottom: 12 }}>
          <span className="section-label-prefix">//</span> About this model
        </div>
        {model.lesson.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {model.facts && model.facts.length > 0 && (
          <div className="lab-facts">
            {model.facts.map((f) => (
              <div key={f.label} className="lab-fact">
                <span className="lab-fact-label">{f.label}</span>
                <span className="lab-fact-value">{f.value}</span>
              </div>
            ))}
          </div>
        )}
        {model.credit && <p className="lab-credit">{model.credit}</p>}
      </section>

      {/* ── learning mode ── */}
      {learnTabs.length > 0 && (
        <section className="wb-learn glass-panel">
          <div className="section-label" style={{ marginBottom: 12 }}>
            <span className="section-label-prefix">//</span> Learning mode
          </div>
          <div className="wb-learn-tabs" role="tablist">
            {learnTabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={activeLearn === t.key}
                className={`wb-learn-tab ${activeLearn === t.key ? "active" : ""}`}
                onClick={() => setLearnTab(t.key)}
              >
                <t.Icon size={15} aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>
          <div className="wb-learn-body">
            {activeLearn === "concepts" && (
              <ul className="wb-learn-list">
                {model.concepts!.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}
            {activeLearn === "applications" && (
              <ul className="wb-learn-list wb-learn-apps">
                {model.applications!.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}
            {activeLearn === "tasks" && (
              <ol className="wb-learn-tasks">
                {model.tasks!.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ol>
            )}
            {activeLearn === "challenge" && (
              <div className="wb-challenge">
                <Trophy size={18} aria-hidden="true" />
                <p>{model.challenge}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function ControlRow({
  control,
  value,
  onChange,
}: {
  control: LabControl;
  value: number | boolean | string | undefined;
  onChange: (key: string, value: number | boolean | string) => void;
}) {
  if (control.kind === "slider") {
    const v = typeof value === "number" ? value : control.default;
    // Fill the track up to the thumb so the slider reads its own magnitude.
    const pct = Math.max(0, Math.min(100, ((v - control.min) / (control.max - control.min)) * 100));
    return (
      <div className="wb-ctrl">
        <div className="wb-ctrl-row">
          <label htmlFor={`c-${control.key}`}>{control.label}</label>
          <span className="wb-ctrl-val">
            {v.toFixed(decimals(control.step))}
            {control.unit ?? ""}
          </span>
        </div>
        <input
          id={`c-${control.key}`}
          type="range"
          className="wb-range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={v}
          onChange={(e) => onChange(control.key, parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, var(--color-eduverse-accent) ${pct}%, oklch(30% 0.03 264 / 0.7) ${pct}%)`,
          }}
        />
      </div>
    );
  }

  if (control.kind === "toggle") {
    const on = typeof value === "boolean" ? value : control.default;
    return (
      <div className="wb-ctrl wb-ctrl-inline">
        <label htmlFor={`c-${control.key}`}>{control.label}</label>
        <button
          id={`c-${control.key}`}
          role="switch"
          aria-checked={on}
          className={`wb-switch ${on ? "on" : ""}`}
          onClick={() => onChange(control.key, !on)}
        >
          <span className="wb-switch-knob" />
        </button>
      </div>
    );
  }

  // select
  const val = typeof value === "string" ? value : control.default;
  return (
    <div className="wb-ctrl">
      <div className="wb-ctrl-row">
        <label htmlFor={`c-${control.key}`}>{control.label}</label>
      </div>
      <select
        id={`c-${control.key}`}
        className="wb-select"
        value={val}
        onChange={(e) => onChange(control.key, e.target.value)}
      >
        {control.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
