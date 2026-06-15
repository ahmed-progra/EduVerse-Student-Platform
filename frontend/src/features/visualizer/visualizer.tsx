"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { initSkulpt, runCode, nextStep, isPaused, type StepFrame } from "./step-engine";
import { MemoryPanel } from "./memory-panel";
import { DebuggerPanel } from "./debugger-panel";
import { GradientButton } from "@/components/ui/gradient-button";
import { api } from "@/services/api-client";
import {
  Play, StepForward, Pause, RotateCcw,
  FastForward, Clock, Code2, SkipForward, Copy, Terminal, Eye
} from "lucide-react";
import { ASTViewer } from "./ast-viewer";

interface VisualizerProps {
  initialCode?: string;
  language?: string;
  onXpEarn?: (amount: number) => void;
}

const STORAGE_PREFIX = "eduverse_code_";
const STEPPABLE_LANGUAGES = ["python"];
// Markup/style languages render in a sandboxed iframe — you don't "execute"
// them through a code runner, you see them. (C++ etc. still use Judge0.)
const PREVIEW_LANGUAGES = ["html", "css"];

/**
 * Build the document shown in the live-preview iframe.
 *  - HTML: the learner's markup renders directly.
 *  - CSS: the styles are applied to a demo page. We always include a base
 *    set of elements, plus an auto-generated block for every class selector
 *    found in the CSS (each with a few children) so flex/grid/box rules on
 *    custom classes actually demonstrate something.
 */
function buildPreviewDoc(language: string, code: string): string {
  if (language.toLowerCase() === "html") {
    // Partial fragments render fine; a full document passes through untouched.
    return code;
  }

  // CSS: discover the class selectors the lesson targets.
  const classes = new Set<string>();
  const re = /\.(-?[A-Za-z_][\w-]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) && classes.size < 10) classes.add(m[1]);

  const customBlocks = [...classes]
    .map(
      (c) =>
        `<div class="${c}"><span>.${c}</span><div>one</div><div>two</div><div>three</div></div>`
    )
    .join("\n      ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
/* preview reset so the lesson's CSS is what shows */
body { margin: 16px; font-family: system-ui, sans-serif; color: #1c1a26; background: #fff; }
.eduverse-demo-label { font: 600 11px/1.4 monospace; color: #888; text-transform: uppercase; letter-spacing: .05em; margin: 18px 0 6px; }
${code}
</style>
</head>
<body>
  <header>
    <nav class="navbar"><a href="#">Home</a> <a href="#">Docs</a> <a href="#">About</a></nav>
  </header>
  <h1>Heading One</h1>
  <h2>Heading Two</h2>
  <h3>Heading Three</h3>
  <p>A paragraph of demo text with a <a href="#">link</a> and <strong>strong</strong> emphasis.</p>
  <button>A Button</button>
  <ul><li>First item</li><li>Second item</li><li>Third item</li></ul>
  <div class="container">
    <div class="card"><h3>Card title</h3><p>Card body text.</p></div>
    <div class="box">A box</div>
  </div>
  ${classes.size ? `<div class="eduverse-demo-label">Your classes</div>\n      ${customBlocks}` : ""}
</body>
</html>`;
}

export function Visualizer({ initialCode = "", language = "python" }: VisualizerProps) {
  const isSteppable = STEPPABLE_LANGUAGES.includes(language.toLowerCase());
  const isPreviewable = PREVIEW_LANGUAGES.includes(language.toLowerCase());
  const [code, setCode] = useState(() => {
    if (typeof window !== "undefined" && initialCode) {
      const saved = localStorage.getItem(STORAGE_PREFIX + initialCode.slice(0, 32));
      return saved || initialCode;
    }
    return initialCode;
  });
  const [currentLine, setCurrentLine] = useState(-1);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "finished" | "error">("idle");
  const [frames, setFrames] = useState<StepFrame[]>([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(-1);
  const [output, setOutput] = useState("");
  const [speed, setSpeed] = useState(800);
  const [autoPlay, setAutoPlay] = useState(false);
  const [skLoaded, setSkLoaded] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ line: number; message: string; type: string } | null>(null);
  const [showAST, setShowAST] = useState(false);
  const [runningDirect, setRunningDirect] = useState(false);

  // Debounced document for the live HTML/CSS preview iframe.
  const [previewDoc, setPreviewDoc] = useState(() => (isPreviewable ? buildPreviewDoc(language, code) : ""));
  useEffect(() => {
    if (!isPreviewable) return;
    const t = setTimeout(() => setPreviewDoc(buildPreviewDoc(language, code)), 250);
    return () => clearTimeout(t);
  }, [code, language, isPreviewable]);

  const autoPlayRef = useRef(autoPlay);
  const speedRef = useRef(speed);
  const statusRef = useRef(status);
  const codeRef = useRef(code);

  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { codeRef.current = code; }, [code]);
  useEffect(() => {
    if (!code || code === initialCode) return;
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_PREFIX + initialCode.slice(0, 32), code);
    }, 500);
    return () => clearTimeout(timer);
  }, [code, initialCode]);

  const framesRef = useRef<StepFrame[]>([]);
  useEffect(() => { framesRef.current = frames; }, [frames]);

  useEffect(() => {
    initSkulpt().then((ok) => setSkLoaded(ok));
  }, []);

  const MAX_FRAMES = 50000;

  const handleStep = useCallback((frame: StepFrame) => {
    setCurrentLine(frame.lineNumber);
    setFrames((prev) => {
      if (prev.length >= MAX_FRAMES) return prev;
      return [...prev, frame];
    });
    setCurrentFrameIdx((prev) => Math.min(prev + 1, MAX_FRAMES - 1));
    if (frame.output) setOutput(frame.output);

    if (frame.error) {
      setErrorInfo(frame.error);
      setAutoPlay(false);
    }

    setStatus(isPaused() ? "paused" : "running");
  }, []);

  const handleDone = useCallback((reason: "finished" | "error", errMsg?: string) => {
    setAutoPlay(false);
    if (reason === "error") {
      setStatus("error");
      if (errMsg) setOutput((prev) => prev + (prev ? "\n" : "") + `Error: ${errMsg}`);
    } else {
      setStatus("finished");
    }
  }, []);

  const handleError = useCallback((line: number, msg: string, type: string) => {
    setErrorInfo({ line, message: msg, type });
  }, []);

  const handleRun = useCallback(async () => {
    setFrames([]);
    setCurrentFrameIdx(-1);
    setCurrentLine(-1);
    setErrorInfo(null);
    setOutput("");
    setStatus("running");
    setAutoPlay(false);

    await runCode(codeRef.current, handleStep, handleDone, handleError, false);
  }, [handleStep, handleDone, handleError]);

  const handleRunAll = useCallback(async () => {
    setFrames([]);
    setCurrentFrameIdx(-1);
    setCurrentLine(-1);
    setErrorInfo(null);
    setOutput("");
    setStatus("running");
    setAutoPlay(false);
    await runCode(codeRef.current, handleStep, handleDone, handleError, true);
  }, [handleStep, handleDone, handleError]);

  const handleDirectRun = useCallback(async () => {
    if (runningDirect) return;
    setRunningDirect(true);
    setOutput("");
    setErrorInfo(null);
    try {
      const res = await api.executeCode({ code: codeRef.current, language });
      const data = res.data;
      if (data.error) {
        setOutput(`Error: ${data.error}`);
        setStatus("error");
      } else {
        setOutput(data.stdout || data.stderr || "(no output)");
        setStatus("finished");
      }
    } catch (err: unknown) {
      setOutput(`Execution failed: ${err instanceof Error ? err.message : String(err)}`);
      setStatus("error");
    } finally {
      setRunningDirect(false);
    }
  }, [language, runningDirect]);

  const handleNextStep = useCallback(() => {
    if (status === "idle" || status === "finished" || status === "error") {
      handleRun();
      return;
    }
    if (isPaused()) {
      nextStep();
      setStatus("running");
    }
  }, [status, handleRun]);

  const handleReset = useCallback(() => {
    setAutoPlay(false);
    setFrames([]);
    setCurrentFrameIdx(-1);
    setCurrentLine(-1);
    setErrorInfo(null);
    setOutput("");
    setStatus("idle");
    if (isPaused()) {
      nextStep();
    }
  }, []);

  const handleAutoPlayToggle = useCallback(() => {
    if (autoPlay) {
      setAutoPlay(false);
    } else {
      if (status === "idle") {
        handleRun();
      }
      setAutoPlay(true);
    }
  }, [autoPlay, status, handleRun]);

  useEffect(() => {
    if (!autoPlay) return;
    if (status === "finished" || status === "error") {
      setAutoPlay(false);
      return;
    }
    const interval = setInterval(() => {
      if (isPaused()) {
        nextStep();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [autoPlay, status, speed]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleNextStep();
      }
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        handleRunAll();
      }
      if (e.key === "r" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNextStep, handleRunAll, handleReset]);

  const goToFrame = useCallback((idx: number) => {
    if (idx >= 0 && idx < frames.length) {
      setCurrentFrameIdx(idx);
      setCurrentLine(frames[idx].lineNumber);
    }
  }, [frames]);

  const highlightedLines = useRef<Set<number>>(new Set());
  frames.forEach((f) => highlightedLines.current.add(f.lineNumber));

  const lineCount = useMemo(() => code.split("\n").length, [code]);

  const langLabel = language.charAt(0).toUpperCase() + language.slice(1);

  // ── Live preview: HTML & CSS render in a sandboxed iframe ──
  if (isPreviewable) {
    return (
      <div className="visualizer-wrap">
        <div className="grid md:grid-cols-2 gap-3">
          {/* Editor */}
          <div className="visualizer-editor-area">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-eduverse-text-muted" />
                <span className="text-xs font-semibold text-eduverse-text-muted uppercase tracking-wider">{langLabel}</span>
              </div>
              <span className="text-[10px] text-eduverse-text-muted">{code.split("\n").length} lines</span>
            </div>
            <div className="code-editor-wrap">
              <div className="code-editor-gutter">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} className="code-editor-line-num">{i + 1}</div>
                ))}
              </div>
              <textarea
                className="code-editor-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                wrap="off"
                placeholder={`Write your ${langLabel} here — the preview updates live...`}
              />
            </div>
          </div>
          {/* Live preview */}
          <div className="visualizer-editor-area flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-eduverse-accent" />
                <span className="text-xs font-semibold text-eduverse-text-muted uppercase tracking-wider">
                  {language.toLowerCase() === "css" ? "Live preview (demo page)" : "Live preview"}
                </span>
              </div>
              <span className="text-[10px] text-eduverse-text-muted">updates as you type</span>
            </div>
            <iframe
              title={`${langLabel} preview`}
              className="w-full bg-white"
              style={{ minHeight: 320, border: "none", borderRadius: "0 0 0.75rem 0.75rem" }}
              sandbox="allow-scripts"
              srcDoc={previewDoc}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="px-3 py-2 rounded-xl border border-white/10 text-eduverse-text-muted hover:text-white hover:bg-white/5 transition-colors text-xs flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
          <button
            onClick={() => { setCode(initialCode); localStorage.removeItem(STORAGE_PREFIX + initialCode.slice(0, 32)); }}
            className="px-3 py-2 rounded-xl border border-white/10 text-eduverse-text-muted hover:text-white hover:bg-white/5 transition-colors text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>
    );
  }

  if (!isSteppable) {
    return (
      <div className="visualizer-wrap">
        <div className="visualizer-editor-area">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-eduverse-text-muted" />
              <span className="text-xs font-semibold text-eduverse-text-muted uppercase tracking-wider">{langLabel}</span>
            </div>
            <span className="text-[10px] text-eduverse-text-muted">{code.split("\n").length} lines</span>
          </div>
          <div className="code-editor-wrap">
            <div className="code-editor-gutter">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="code-editor-line-num">{i + 1}</div>
              ))}
            </div>
            <textarea
              className="code-editor-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              wrap="off"
              placeholder={`# Write your ${langLabel} code here...`}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <GradientButton onClick={handleDirectRun} loading={runningDirect} className="flex items-center gap-2">
            <Play className="w-4 h-4" /> Run
          </GradientButton>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="px-3 py-2 rounded-xl border border-white/10 text-eduverse-text-muted hover:text-white hover:bg-white/5 transition-colors text-xs flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
        </div>
        {output && (
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="text-[10px] uppercase tracking-wider px-3 py-1.5 border-b border-white/5 text-eduverse-text-muted bg-black/20">
              Output
            </div>
            <pre className="p-3 text-xs font-mono whitespace-pre-wrap text-eduverse-text bg-black/30 min-h-[60px] max-h-[200px] overflow-auto">
              {output}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="visualizer-wrap">

      {/* ── Execution Controls ── */}
      <div className="visualizer-controls">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            disabled={status === "idle"}
            className="visualizer-btn"
            title="Reset (Ctrl+Shift+R)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNextStep}
            disabled={status === "running" && !isPaused()}
            className="visualizer-btn visualizer-btn-primary"
            title="Next Step (Ctrl+Enter)"
          >
            <StepForward className="w-4 h-4" />
          </button>
          <button
            onClick={handleAutoPlayToggle}
            disabled={status === "error"}
            className={`visualizer-btn ${autoPlay ? "visualizer-btn-active" : ""}`}
            title={autoPlay ? "Pause" : "Auto Play"}
          >
            {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleRunAll}
            disabled={status === "running" || status === "paused"}
            className="visualizer-btn"
            title="Run All (Ctrl+Shift+Enter)"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAST((v) => !v)}
            className={`visualizer-btn ${showAST ? "visualizer-btn-active" : ""}`}
            title="Toggle AST"
          >
            <Code2 className="w-3.5 h-3.5" />
          </button>
          <div className="text-[10px] text-eduverse-text-muted">
            Step {frames.length}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-eduverse-text-muted" />
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="visualizer-slider"
            title="Speed"
          />
          <FastForward className="w-3 h-3 text-eduverse-text-muted" />
          <span className="text-[10px] text-eduverse-text-muted w-12 text-right">
            {speed < 500 ? "Fast" : speed < 1200 ? "Normal" : "Slow"}
          </span>
        </div>

      </div>

      {/* ── Code Editor Area ── */}
      <div className="visualizer-editor-area">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-eduverse-text-muted" />
            <span className="text-xs font-semibold text-eduverse-text-muted uppercase tracking-wider">{langLabel}</span>
          </div>
          <span className="text-[10px] text-eduverse-text-muted">{code.split("\n").length} lines</span>
        </div>
        <div className="code-editor-wrap" style={{ position: "relative" }}>
          <div className="code-editor-gutter">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="code-editor-line-num">{i + 1}</div>
            ))}
          </div>
          <textarea
            className="code-editor-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            readOnly={status !== "idle"}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            wrap="off"
            placeholder={`# Write your ${langLabel} code here...`}
          />
          {/* Overlay line highlights */}
          {status !== "idle" && currentLine > 0 && (
            <div 
              className="visualizer-line-highlight" 
              style={{ top: `calc(${(currentLine - 1) * 1.65}em + 14px)` }} 
            />
          )}
          {status === "error" && errorInfo && errorInfo.line > 0 && (
            <div 
              className="visualizer-error-line" 
              style={{ top: `calc(${(errorInfo.line - 1) * 1.65}em + 14px)` }} 
            />
          )}
        </div>
      </div>

      {/* ── Condition / Loop badges ── */}
      {currentFrameIdx >= 0 && frames[currentFrameIdx]?.condition && (
        <div className="visualizer-badge-track">
          <div className="visualizer-badge condition-badge">
            <span className="badge-label">Condition:</span>
            <code>{frames[currentFrameIdx].condition!.text}</code>
            <span className={`badge-result ${frames[currentFrameIdx].condition!.result ? "true" : "false"}`}>
              {frames[currentFrameIdx].condition!.result ? "True" : "False"}
            </span>
          </div>
        </div>
      )}

      {currentFrameIdx >= 0 && frames[currentFrameIdx]?.loopInfo && (
        <div className="visualizer-badge-track">
          <div className="visualizer-badge loop-badge">
            <span className="badge-label">Loop:</span>
            <span>Iteration {frames[currentFrameIdx].loopInfo!.iteration}/{frames[currentFrameIdx].loopInfo!.total || "?"}</span>
            {frames[currentFrameIdx].loopInfo!.varName && (
              <>
                <span className="badge-sep">|</span>
                <span>{frames[currentFrameIdx].loopInfo!.varName} = {String(frames[currentFrameIdx].loopInfo!.varValue)}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom panels: Memory + Debugger ── */}
      <div className="visualizer-panels">
        <MemoryPanel
          frames={frames}
          currentIdx={currentFrameIdx}
          onFrameSeek={goToFrame}
        />
        <DebuggerPanel
          frames={frames}
          currentIdx={currentFrameIdx}
          status={status}
          error={errorInfo}
          output={output}
          code={code}
        />
      </div>

      <ASTViewer
        code={code}
        visible={showAST}
        onToggle={() => setShowAST((v) => !v)}
        onLineClick={(line) => {
          setCurrentLine(line);
          const editor = document.querySelector(".code-editor-textarea") as HTMLTextAreaElement;
          if (editor) {
            const lines = code.split("\n");
            const targetLine = Math.min(line, lines.length) - 1;
            const lineHeight = 1.65 * parseFloat(getComputedStyle(editor).fontSize || "14px");
            editor.scrollTop = targetLine * lineHeight - 100;
          }
        }}
      />
    </div>
  );
}
