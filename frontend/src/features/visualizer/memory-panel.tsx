"use client";

import { memo, useMemo, useState, Fragment } from "react";
import type { StepFrame } from "./step-engine";
import { ChevronDown, ChevronRight } from "lucide-react";

interface MemoryPanelProps {
  frames: StepFrame[];
  currentIdx: number;
  onFrameSeek: (idx: number) => void;
}

export const MemoryPanel = memo(function MemoryPanel({
  frames,
  currentIdx,
  onFrameSeek,
}: MemoryPanelProps) {
  const [expandedVars, setExpandedVars] = useState<Set<string>>(new Set());

  const currentFrame = currentIdx >= 0 && currentIdx < frames.length ? frames[currentIdx] : null;
  const prevFrame = currentIdx > 0 ? frames[currentIdx - 1] : null;

  const currentVars = currentFrame?.variables || {};

  const changedVars = useMemo(() => {
    // Derive from the frame objects directly (stable per step) so the memo
    // doesn't depend on the `|| {}` fallbacks, which are new each render.
    const cur = currentFrame?.variables || {};
    const prev = prevFrame?.variables || {};
    const changed = new Set<string>();
    for (const [k, v] of Object.entries(cur)) {
      const p = prev[k];
      if (!p || JSON.stringify(p.value) !== JSON.stringify(v.value)) {
        changed.add(k);
      }
    }
    return changed;
  }, [currentFrame, prevFrame]);

  const changeLog = useMemo(() => {
    const log: { step: number; varName: string; from: unknown; to: unknown }[] = [];
    for (let i = 1; i < frames.length; i++) {
      const prev = frames[i - 1].variables;
      const curr = frames[i].variables;
      for (const [k, v] of Object.entries(curr)) {
        const prevVal = prev[k]?.value;
        const currVal = v.value;
        if (prevVal !== undefined && JSON.stringify(prevVal) !== JSON.stringify(currVal)) {
          log.push({ step: i, varName: k, from: prevVal, to: currVal });
        }
      }
    }
    return log;
  }, [frames]);

  const varHistory = useMemo(() => {
    const hist: Record<string, any[]> = {};
    for (const frame of frames) {
      for (const [k, v] of Object.entries(frame.variables)) {
        if (!hist[k]) hist[k] = [];
        const val = v.value;
        if (
          hist[k].length === 0 ||
          JSON.stringify(hist[k][hist[k].length - 1]) !== JSON.stringify(val)
        ) {
          hist[k].push(val);
        }
      }
    }
    return hist;
  }, [frames]);

  const toggleVar = (name: string) => {
    setExpandedVars((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const formatValue = (val: unknown, type: string): string => {
    if (type === "str") return `"${String(val)}"`;
    if (type === "NoneType") return "None";
    if (type === "list")
      return `[${Array.isArray(val) ? val.map((v: unknown) => formatValue(v, typeof v)).join(", ") : "..."}]`;
    if (type === "dict") return "{...}";
    return String(val);
  };

  return (
    <div className="visualizer-panel memory-panel">
      <div className="panel-header">
        <span className="panel-title">Memory & Variables</span>
        <span className="panel-badge">{Object.keys(currentVars).length} vars</span>
      </div>

      <div className="panel-body">
        {Object.keys(currentVars).length === 0 ? (
          <div className="panel-empty">No variables yet</div>
        ) : (
          <table className="memory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(currentVars)
                .filter(([k]) => !k.startsWith("_"))
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([name, info]) => {
                  const changed = changedVars.has(name);
                  const history = varHistory[name] || [];
                  const isExpanded = expandedVars.has(name);

                  return (
                    <Fragment key={name}>
                      <tr
                        className={`memory-row ${changed ? "memory-row-changed" : ""}`}
                        onClick={() => history.length > 1 && toggleVar(name)}
                      >
                        <td className="memory-name">{name}</td>
                        <td className="memory-type">{info.type}</td>
                        <td className="memory-value">
                          <span className="value-text">{formatValue(info.value, info.type)}</span>
                          {history.length > 1 && (
                            <span className="history-toggle">
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && history.length > 1 && (
                        <tr className="memory-history-row">
                          <td colSpan={3}>
                            <div className="memory-history">
                              <span className="history-label">History:</span>
                              {history.map((h: unknown, i: number) => (
                                <span key={i} className="history-val">
                                  {formatValue(h, typeof h === "string" ? "str" : typeof h)}
                                  {i < history.length - 1 && (
                                    <span className="history-arrow">→</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>

      {/* Change Log */}
      <div className="panel-footer">
        <div className="footer-header">Change Log</div>
        <div className="change-log">
          {changeLog.length === 0 ? (
            <div className="log-empty">No changes yet</div>
          ) : (
            changeLog.slice(-15).map((entry, i) => (
              <div key={i} className="log-entry" onClick={() => onFrameSeek(entry.step)}>
                <span className="log-step">Step {entry.step}:</span>
                <span className="log-var">{entry.varName}</span>
                <span className="log-change">
                  {formatValue(entry.from, typeof entry.from)} →{" "}
                  {formatValue(entry.to, typeof entry.to)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});
