"use client";

import { memo, useState } from "react";
import type { StepFrame } from "./step-engine";
import { AlertTriangle, Info, Sparkles } from "lucide-react";
import { api } from "@/services/api-client";

interface DebuggerPanelProps {
  frames: StepFrame[];
  currentIdx: number;
  status: string;
  error: { line: number; message: string; type: string } | null;
  output: string;
  code?: string;
}

export const DebuggerPanel = memo(function DebuggerPanel({
  frames,
  currentIdx,
  status,
  error,
  output,
  code,
}: DebuggerPanelProps) {
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const frame = currentIdx >= 0 && currentIdx < frames.length ? frames[currentIdx] : null;

  return (
    <div className="visualizer-panel debugger-panel">
      <div className="panel-header">
        <span className="panel-title">Debugger</span>
        <span
          className={`panel-badge ${
            status === "error"
              ? "badge-error"
              : status === "finished"
                ? "badge-done"
                : status === "paused"
                  ? "badge-paused"
                  : "badge-idle"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="panel-body">
        {/* Current Line */}
        <div className="debug-section">
          <div className="debug-label">Current Line</div>
          <div className="debug-value">{frame ? `#${frame.lineNumber}` : "—"}</div>
        </div>

        {/* Current Scope */}
        <div className="debug-section">
          <div className="debug-label">Scope</div>
          <div className="debug-value">{frame?.scopes?.[frame.scopes.length - 1] || "global"}</div>
        </div>

        {/* Call Stack */}
        <div className="debug-section">
          <div className="debug-label">Call Stack</div>
          <div className="debug-callstack">
            {frame && frame.callStack.length > 0 ? (
              frame.callStack.map((entry, i) => (
                <div key={i} className="callstack-entry">
                  <span className="callstack-indent" style={{ paddingLeft: `${i * 12}px` }} />
                  <span className="callstack-name">{entry.name}</span>
                  <span className="callstack-line">:{entry.line}</span>
                </div>
              ))
            ) : (
              <span className="debug-value dim">—</span>
            )}
          </div>
        </div>

        {/* Execution Status */}
        <div className="debug-section">
          <div className="debug-label">Status</div>
          <div className="debug-value">
            {status === "idle" && "Ready — click Run or Next Step"}
            {status === "running" && "Executing..."}
            {status === "paused" && "Paused at line " + (frame?.lineNumber || "?")}
            {status === "finished" && "Execution complete ✓"}
            {status === "error" && "Runtime error occurred"}
          </div>
        </div>

        {/* Output */}
        {output && (
          <div className="debug-section">
            <div className="debug-label">Output</div>
            <pre className="debug-output">{output}</pre>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="debug-error">
            <div className="error-header">
              <AlertTriangle className="w-4 h-4" />
              <span>{error.type}</span>
            </div>
            <div className="error-line">at line {error.line}</div>
            <div className="error-message">{error.message}</div>
            <div className="error-hint">
              <Info className="w-3 h-3" />
              <span>
                Check the highlighted line. Look for syntax issues, undefined variables, or type
                mismatches.
              </span>
            </div>
            <button
              className="error-diagnose-btn"
              onClick={async () => {
                setDiagnosing(true);
                try {
                  const res = await api.aiExplainError({
                    code: code || "",
                    errorType: error.type,
                    errorMessage: error.message,
                    line: error.line,
                    language: "python",
                  });
                  setDiagnosis(res.data.text);
                } catch (err: unknown) {
                  setDiagnosis(err instanceof Error ? err.message : "Could not reach AI service.");
                } finally {
                  setDiagnosing(false);
                }
              }}
              disabled={diagnosing}
            >
              <Sparkles className="w-3 h-3" />
              {diagnosing ? "Diagnosing..." : "Ask AI"}
            </button>
            {diagnosis && (
              <div className="error-diagnosis">
                <div className="diagnosis-text">{diagnosis}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
