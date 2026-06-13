/**
 * Judge0 code-execution client (Python & C++ run/battle scoring).
 *
 * Hardened for live use: request timeout, one retry on transient failure,
 * explicit throttle/down messaging, and optional API-key auth. HTML/CSS are
 * never sent here — they render in the browser preview.
 *
 * Auth: set JUDGE0_API_KEY to lift the public endpoint's rate limits.
 *   - RapidAPI:    also set JUDGE0_HOST (e.g. judge0-ce.p.rapidapi.com)
 *   - Self-hosted: leave JUDGE0_HOST unset → sent as X-Auth-Token
 */

const JUDGE0_URL = process.env.JUDGE0_URL || "https://ce.judge0.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const JUDGE0_HOST = process.env.JUDGE0_HOST || "";
const TIMEOUT_MS = 20_000;

const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  cpp: 54,
};

const NON_EXECUTABLE_LANGUAGES = new Set(["html", "css"]);

export interface Judge0Result {
  stdout: string;
  stderr: string;
  error: string | null;
  time: string;
  status: string;
}

function authHeaders(): Record<string, string> {
  if (!JUDGE0_API_KEY) return {};
  if (JUDGE0_HOST) {
    return { "X-RapidAPI-Key": JUDGE0_API_KEY, "X-RapidAPI-Host": JUDGE0_HOST };
  }
  return { "X-Auth-Token": JUDGE0_API_KEY };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function executeCode(
  sourceCode: string,
  language: string,
  stdin: string = ""
): Promise<Judge0Result> {
  if (NON_EXECUTABLE_LANGUAGES.has(language)) {
    return {
      stdout: sourceCode,
      stderr: "",
      error: null,
      time: "0",
      status: "Rendered (markup/styling - not executed)",
    };
  }

  const langId = LANGUAGE_IDS[language];
  if (!langId) {
    return { stdout: "", stderr: "", error: `Unsupported language: ${language}`, time: "0", status: "Error" };
  }

  const body = JSON.stringify({ source_code: sourceCode, language_id: langId, stdin });
  const headers = { "Content-Type": "application/json", ...authHeaders() };

  // Up to 2 attempts; transient failures (timeout, 5xx, network) get one retry.
  let lastError = "Code execution failed.";
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });

      if (res.status === 429) {
        return {
          stdout: "",
          stderr: "",
          error: "The code runner is rate-limited right now. Wait a few seconds and run again." +
            (JUDGE0_API_KEY ? "" : " (Tip: set JUDGE0_API_KEY in .env to raise the limit.)"),
          time: "0",
          status: "Rate limited",
        };
      }
      if (res.status === 401 || res.status === 403) {
        return { stdout: "", stderr: "", error: "Code runner rejected the request — check JUDGE0_API_KEY.", time: "0", status: "Auth error" };
      }
      if (res.status >= 500) {
        lastError = "The code runner is temporarily unavailable. Please try again.";
        if (attempt === 0) { await sleep(800); continue; }
        return { stdout: "", stderr: "", error: lastError, time: "0", status: "Error" };
      }
      if (!res.ok) {
        return { stdout: "", stderr: "", error: `Code runner error (HTTP ${res.status}).`, time: "0", status: "Error" };
      }

      const result = await res.json().catch(() => ({}));
      return {
        stdout: result.stdout || "",
        stderr: result.stderr || "",
        error: result.compile_output || result.message || null,
        time: result.time || "0",
        status: result.status?.description || "Unknown",
      };
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      lastError = aborted
        ? "Code execution timed out. Try simplifying your code or run again."
        : "Couldn't reach the code runner. Check your connection (or the JUDGE0_URL setting).";
      if (!aborted && attempt === 0) { await sleep(800); continue; }
      if (aborted) break;
    } finally {
      clearTimeout(timer);
    }
  }
  return { stdout: "", stderr: "", error: lastError, time: "0", status: "Error" };
}
