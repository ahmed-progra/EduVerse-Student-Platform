"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Auto-playing mock of the EduVerse step visualizer.
 * Walks through a small Python snippet, moving the execution
 * highlight and updating the variables panel like the real thing.
 * Pauses when off-screen; renders the final frame statically
 * under prefers-reduced-motion.
 */

type Step = {
  line: number;
  vars: [name: string, value: string][];
  changed: string[];
  out?: string;
};

const STEPS: Step[] = [
  { line: 1, vars: [["nums", "[3, 7, 1, 9]"]], changed: ["nums"] },
  { line: 2, vars: [["nums", "[3, 7, 1, 9]"], ["total", "0"]], changed: ["total"] },
  { line: 3, vars: [["nums", "[3, 7, 1, 9]"], ["total", "0"], ["n", "3"]], changed: ["n"] },
  { line: 4, vars: [["nums", "[3, 7, 1, 9]"], ["total", "3"], ["n", "3"]], changed: ["total"] },
  { line: 3, vars: [["nums", "[3, 7, 1, 9]"], ["total", "3"], ["n", "7"]], changed: ["n"] },
  { line: 4, vars: [["nums", "[3, 7, 1, 9]"], ["total", "10"], ["n", "7"]], changed: ["total"] },
  { line: 3, vars: [["nums", "[3, 7, 1, 9]"], ["total", "10"], ["n", "1"]], changed: ["n"] },
  { line: 4, vars: [["nums", "[3, 7, 1, 9]"], ["total", "11"], ["n", "1"]], changed: ["total"] },
  { line: 3, vars: [["nums", "[3, 7, 1, 9]"], ["total", "11"], ["n", "9"]], changed: ["n"] },
  { line: 4, vars: [["nums", "[3, 7, 1, 9]"], ["total", "20"], ["n", "9"]], changed: ["total"] },
  { line: 5, vars: [["nums", "[3, 7, 1, 9]"], ["total", "20"], ["n", "9"], ["avg", "5.0"]], changed: ["avg"] },
  { line: 6, vars: [["nums", "[3, 7, 1, 9]"], ["total", "20"], ["n", "9"], ["avg", "5.0"]], changed: [], out: "avg = 5.0" },
];

const TICK_MS = 850;
const HOLD_MS = 2600;

/* Syntax-highlighted source, one entry per line */
const CODE: React.ReactNode[] = [
  <>nums <span className="hd-op">=</span> <span className="hd-num">[3, 7, 1, 9]</span></>,
  <>total <span className="hd-op">=</span> <span className="hd-num">0</span></>,
  <><span className="hd-kw">for</span> n <span className="hd-kw">in</span> nums:</>,
  <>{"    "}total <span className="hd-op">+=</span> n</>,
  <>avg <span className="hd-op">=</span> total <span className="hd-op">/</span> <span className="hd-fn">len</span>(nums)</>,
  <><span className="hd-fn">print</span>(<span className="hd-str">f&quot;avg = {"{"}avg{"}"}&quot;</span>)</>,
];

export default function HeroDemo() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(true);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedRef.current) {
      setStep(STEPS.length - 1);
      setRunning(false);
      return;
    }

    const el = rootRef.current;
    let obs: IntersectionObserver | undefined;
    if (el) {
      obs = new IntersectionObserver(
        ([entry]) => { visibleRef.current = entry.isIntersecting; },
        { threshold: 0.2 }
      );
      obs.observe(el);
    }

    let timer: ReturnType<typeof setTimeout>;
    const tick = (current: number) => {
      const last = current >= STEPS.length - 1;
      timer = setTimeout(() => {
        if (!visibleRef.current) {
          tick(current); // stay on this frame until visible again
          return;
        }
        const next = last ? 0 : current + 1;
        setStep(next);
        tick(next);
      }, last ? HOLD_MS : TICK_MS);
    };
    tick(0);

    return () => {
      clearTimeout(timer);
      obs?.disconnect();
    };
  }, []);

  const s = STEPS[step];
  const progress = (step + 1) / STEPS.length;

  return (
    <div className="hd" ref={rootRef} aria-label="Demo of the EduVerse code visualizer stepping through a Python loop">
      <div className="hd-chrome">
        <span className="hd-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="hd-file">average.py</span>
        <span className={`hd-live ${running ? "on" : ""}`}>{running ? "auto-running" : "result"}</span>
      </div>

      <div className="hd-panes">
        <pre className="hd-code">
          {CODE.map((content, i) => {
            const ln = i + 1;
            const active = s.line === ln;
            return (
              <div key={ln} className={`hd-line ${active ? "active" : ""}`}>
                <span className="hd-gutter">{active ? "▸" : ln}</span>
                <code>{content}</code>
              </div>
            );
          })}
        </pre>

        <div className="hd-state">
          <div className="hd-state-label">Variables</div>
          <div className="hd-vars">
            {s.vars.map(([name, value]) => (
              <div
                className={`hd-var ${s.changed.includes(name) ? "changed" : ""}`}
                key={`${name}=${value}`}
              >
                <span className="hd-var-name">{name}</span>
                <span className="hd-var-val">{value}</span>
              </div>
            ))}
          </div>

          <div className="hd-state-label">Console</div>
          <div className="hd-out">
            {s.out ? <span className="hd-out-line">{s.out}</span> : <span className="hd-out-idle">&mdash;</span>}
          </div>
        </div>
      </div>

      <div className="hd-foot">
        <span className="hd-step">step {step + 1} / {STEPS.length}</span>
        <span className="hd-progress" aria-hidden="true">
          <span className="hd-progress-fill" style={{ transform: `scaleX(${progress})` }} />
        </span>
      </div>
    </div>
  );
}
