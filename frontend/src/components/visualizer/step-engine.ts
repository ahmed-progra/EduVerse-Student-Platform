/**
 * Step execution engine for Python using Skulpt.
 * Instruments user code with step calls, runs via Skulpt,
 * and uses Suspension to pause between each statement.
 */

let Sk: any = null;
let skLoadPromise: Promise<boolean> | null = null;
let stepResolve: ((val?: unknown) => void) | null = null;
let pendingError: { line: number; message: string; type: string } | null = null;
let capturedOutput = "";

export interface StepFrame {
  lineNumber: number;
  variables: Record<string, { type: string; value: any }>;
  scopes: string[];
  callStack: { name: string; line: number }[];
  condition?: { text: string; result: boolean };
  loopInfo?: { iteration: number; total: number; varName: string; varValue: any };
  error?: { message: string; type: string; line: number };
  output: string;
  changedVars: string[];
}

export interface ExecutionState {
  status: "idle" | "running" | "paused" | "finished" | "error";
  currentLine: number;
  frames: StepFrame[];
  frameIndex: number;
}

export type StepCallback = (frame: StepFrame) => void;
export type DoneCallback = (reason: "finished" | "error", error?: string) => void;

function instrumentCode(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];
  let inMultiline = false;
  let multilineQuote: string | null = null;

  function isExecutableLine(trimmed: string): boolean {
    if (!trimmed) return false;
    if (trimmed.startsWith("#")) return false;
    if (trimmed.startsWith("def ") || trimmed.startsWith("class ") || trimmed.startsWith("@")) return false;
    if (trimmed.startsWith("elif ") || trimmed.startsWith("else:") || trimmed.startsWith("except") || trimmed.startsWith("finally:")) return false;
    return true;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      result.push(line);
      continue;
    }

    if (!inMultiline && (trimmed.startsWith("#"))) {
      result.push(line);
      continue;
    }

    if (!inMultiline && (trimmed.startsWith('"""') || trimmed.startsWith("'''"))) {
      inMultiline = true;
      multilineQuote = trimmed.startsWith('"""') ? '"""' : "'''";
      result.push(line);
      continue;
    }

    if (inMultiline) {
      result.push(line);
      if (trimmed.includes(multilineQuote!) && (trimmed.endsWith(multilineQuote!) || trimmed.slice(0 - multilineQuote!.length) === multilineQuote!)) {
        inMultiline = false;
        multilineQuote = null;
      }
      continue;
    }

    const indent = line.match(/^(\s*)/)?.[1] || "";
    const lineNo = i + 1;

    if (!isExecutableLine(trimmed)) {
      result.push(line);
      continue;
    }

    result.push(`${indent}_sk_step(${lineNo})`);
    result.push(line);
  }

  return result.join("\n");
}

function buildPreamble(): string {
  return "";
}

export async function initSkulpt(): Promise<boolean> {
  if (Sk) return true;
  if (skLoadPromise) return skLoadPromise;
  skLoadPromise = (async () => {
    try {
      const skulpt: any = await import("skulpt");
      Sk = skulpt.default || skulpt;
      Sk.configure({
        output: (text: string) => { capturedOutput += text; },
        read: (x: string) => { throw new Error("input() not supported in visualizer"); },
        python3: true,
      });
      return true;
    } catch {
      return false;
    }
  })();
  return skLoadPromise;
}

function createSkStepFunction(onStep: (lineNo: number) => void): any {
  return new Sk.builtin.func(function (lineNo: any) {
    const n = Sk.ffi.remapToJs(lineNo);
    onStep(n);
    return new Sk.misceval.Suspension(
      function (resume: any) {
        stepResolve = resume;
      },
      null,
      null
    );
  });
}

export async function runCode(
  code: string,
  onStep: StepCallback,
  onDone: DoneCallback,
  onError: (line: number, msg: string, type: string) => void,
  directRun = false
): Promise<void> {
  if (!Sk) {
    const loaded = await initSkulpt();
    if (!loaded) {
      onDone("error", "Skulpt failed to load");
      return;
    }
  }

  stepResolve = null;
  pendingError = null;
  capturedOutput = "";
  const frames: StepFrame[] = [];
  let currentLine = 0;
  const callStack: { name: string; line: number }[] = [{ name: "<module>", line: 0 }];
  const scopeStack: string[] = ["<module>"];

  let lastVars: Record<string, any> = {};

  function captureVars(): Record<string, { type: string; value: any }> {
    try {
      const vars: Record<string, { type: string; value: any }> = {};
      const g = Sk.globals;
      if (!g || !g.items) return vars;
      const items = g.items;
      if (items) {
        for (const [k, v] of items) {
          try {
            const key = Sk.ffi.remapToJs(k);
            if (key === "Sk" || key === "_sk_vars_before" || key === "_sk_keys" || key === "_sk_step" || key.startsWith("__")) continue;
            let val: any;
            let type: string;
            try {
              val = Sk.ffi.remapToJs(v);
              type = typeof val;
              if (v instanceof Sk.builtin.list) type = "list";
              else if (v instanceof Sk.builtin.dict) type = "dict";
              else if (v instanceof Sk.builtin.str) type = "str";
              else if (v instanceof Sk.builtin.int_) type = "int";
              else if (v instanceof Sk.builtin.float_) type = "float";
              else if (v instanceof Sk.builtin.bool) type = "bool";
              else if (v instanceof Sk.builtin.none) { type = "NoneType"; val = null; }
            } catch {
              val = String(v);
              type = typeof v;
            }
            vars[key] = { type, value: val };
          } catch {}
        }
      }
      return vars;
    } catch { return {}; }
  }

  function detectChanges(currentVars: Record<string, { type: string; value: any }>, step: StepFrame) {
    const changed: string[] = [];
    for (const [k, v] of Object.entries(currentVars)) {
      if (lastVars[k] !== undefined && JSON.stringify(lastVars[k]) !== JSON.stringify(v.value)) {
        changed.push(k);
      }
      lastVars[k] = v.value;
    }
    for (const k of Object.keys(lastVars)) {
      if (!currentVars[k]) {
        changed.push(k);
        delete lastVars[k];
      }
    }
    return changed;
  }

  const stepHandler = (lineNo: number) => {
    currentLine = lineNo;

    const vars = captureVars();
    const changedVars = frames.length > 0 ? detectChanges(vars, frames[frames.length - 1]) : [];

    const frame: StepFrame = {
      lineNumber: lineNo,
      variables: vars,
      scopes: [...scopeStack],
      callStack: [...callStack],
      output: capturedOutput,
      changedVars,
    };

    frames.push(frame);
    onStep(frame);
  };

  try {
    Sk.builtins._sk_step = createSkStepFunction(stepHandler);

    const instrumented = directRun ? code : buildPreamble() + "\n" + instrumentCode(code);

    await Sk.misceval.asyncToPromise(() => {
      return Sk.importMainWithBody("user_code", false, instrumented, true);
    });

    onDone("finished");
  } catch (err: unknown) {
    const errStr = String(err);
    let line = currentLine;
    let type = "RuntimeError";
    let message = errStr;

    const lineMatch = errStr.match(/line (\d+)/i);
    if (lineMatch) line = parseInt(lineMatch[1]) - 3;

    const colonIdx = errStr.indexOf(":");
    if (colonIdx > 0) {
      type = errStr.substring(0, colonIdx).trim();
      message = errStr.substring(colonIdx + 1).trim();
    }

    pendingError = { line, message, type };

    const errorFrame: StepFrame = {
      lineNumber: line,
      variables: captureVars(),
      scopes: [...scopeStack],
      callStack: [...callStack],
      error: { message, type, line },
      output: capturedOutput,
      changedVars: [],
    };
    frames.push(errorFrame);
    onStep(errorFrame);

    onError(line, message, type);
    onDone("error", `${type}: ${message}`);
  }
}

export function nextStep() {
  if (stepResolve) {
    stepResolve(undefined);
    stepResolve = null;
  }
}

export function isPaused(): boolean {
  return stepResolve !== null;
}

export function getPendingError(): { line: number; message: string; type: string } | null {
  return pendingError;
}
