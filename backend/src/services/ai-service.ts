/**
 * Centralized AI service — Google AI Studio (Gemini API).
 *
 * Every AI feature in EduVerse goes through this module. It owns:
 *  - API key handling (GOOGLE_AI_API_KEY from .env, never hardcoded)
 *  - request timeouts, retries with backoff, model fallback
 *  - plain-text and strict-JSON generation modes
 *  - input clamping so oversized lesson content can't blow up requests
 *  - structured logging for every call and failure
 */

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/* Ordered by preference; if the configured model 404s we fall back down the list. */
const MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];

const DEFAULT_TIMEOUT_MS = 45_000;
const MAX_RETRIES = 2; // total attempts = 1 + MAX_RETRIES

let activeModel: string | null = null;

export class AIError extends Error {
  /** HTTP status the API route should respond with. */
  httpStatus: number;
  constructor(message: string, httpStatus = 502) {
    super(message);
    this.name = "AIError";
    this.httpStatus = httpStatus;
  }
}

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export interface GenerateOptions {
  system: string;
  prompt: string;
  /** Prior conversation turns, oldest first (for multi-turn chat). */
  history?: ChatTurn[];
  /** When true, asks Gemini for application/json output. */
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  /** Short label used in logs, e.g. "mentor". */
  op?: string;
}

function apiKey(): string {
  return process.env.GOOGLE_AI_API_KEY || "";
}

export function isConfigured(): boolean {
  return apiKey().length >= 20;
}

function preferredModels(): string[] {
  const fromEnv = process.env.GOOGLE_AI_MODEL?.trim();
  const list = fromEnv ? [fromEnv, ...MODEL_CANDIDATES.filter((m) => m !== fromEnv)] : [...MODEL_CANDIDATES];
  if (activeModel) {
    return [activeModel, ...list.filter((m) => m !== activeModel)];
  }
  return list;
}

/** Truncate oversized input instead of failing — large lessons/files still work. */
export function clampText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n…[content truncated for length]";
}

function log(op: string, msg: string) {
  console.log(`[ai] ${new Date().toISOString()} op=${op} ${msg}`);
}

function logError(op: string, msg: string) {
  console.error(`[ai] ${new Date().toISOString()} op=${op} ERROR ${msg}`);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { code?: number; message?: string; status?: string; details?: Array<Record<string, unknown>> };
}

/** Models that do hidden "thinking" by default; we zero its budget so output tokens go to visible text. */
function supportsThinkingControl(model: string): boolean {
  return model.startsWith("gemini-2.5") || model.endsWith("-latest");
}

/** Gemini 429s include a google.rpc.RetryInfo detail like { retryDelay: "12s" }. */
function parseRetryDelayMs(data: GeminiResponse): number | null {
  for (const d of data.error?.details || []) {
    const delay = (d as { retryDelay?: string }).retryDelay;
    if (typeof delay === "string") {
      const secs = parseFloat(delay.replace(/s$/i, ""));
      if (!Number.isNaN(secs) && secs > 0) return Math.min(secs * 1000, 15_000);
    }
  }
  return null;
}

async function callGemini(model: string, body: unknown, timeoutMs: number): Promise<{ status: number; data: GeminiResponse }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Key goes in a header, not the URL, so it never lands in logs.
        "x-goog-api-key": apiKey(),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as GeminiResponse;
    return { status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

function extractText(data: GeminiResponse): string {
  const candidate = data.candidates?.[0];
  const text = (candidate?.content?.parts || [])
    .map((p) => p.text || "")
    .join("")
    .trim();
  return text;
}

/**
 * Core text generation with retry, timeout, and model fallback.
 * Throws AIError with a user-presentable message on failure.
 */
export async function generateText(opts: GenerateOptions): Promise<{ text: string; model: string }> {
  const op = opts.op || "generate";

  if (!isConfigured()) {
    logError(op, "GOOGLE_AI_API_KEY missing or too short");
    throw new AIError("AI service is not configured. Set GOOGLE_AI_API_KEY in the .env file.", 503);
  }

  const contents = [
    ...(opts.history || []).slice(-12).map((t) => ({
      role: t.role === "model" ? "model" : "user",
      parts: [{ text: clampText(t.text, 8_000) }],
    })),
    { role: "user", parts: [{ text: opts.prompt }] },
  ];

  const models = preferredModels();
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let lastError: AIError = new AIError("AI request failed.");

  for (const model of models) {
    const generationConfig: Record<string, unknown> = {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxOutputTokens ?? 2048,
    };
    if (opts.json) generationConfig.responseMimeType = "application/json";
    // Thinking-capable models spend output tokens on hidden reasoning by default;
    // disable it so tutoring responses stay fast and budget goes to visible text.
    if (supportsThinkingControl(model)) generationConfig.thinkingConfig = { thinkingBudget: 0 };

    const body = {
      systemInstruction: { parts: [{ text: opts.system }] },
      contents,
      generationConfig,
    };

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const started = Date.now();
      try {
        const { status, data } = await callGemini(model, body, timeoutMs);
        const ms = Date.now() - started;

        if (status === 200) {
          const text = extractText(data);
          const finish = data.candidates?.[0]?.finishReason;
          if (!text) {
            const block = data.promptFeedback?.blockReason;
            if (block || finish === "SAFETY") {
              logError(op, `model=${model} blocked reason=${block || finish} ms=${ms}`);
              throw new AIError("The AI declined this request (safety filter). Try rephrasing.", 422);
            }
            logError(op, `model=${model} empty response finish=${finish} ms=${ms}`);
            throw new AIError("The AI returned an empty response. Please try again.", 502);
          }
          activeModel = model;
          log(op, `model=${model} ok ms=${ms} chars=${text.length}${finish && finish !== "STOP" ? ` finish=${finish}` : ""}`);
          return { text, model };
        }

        const errMsg = data.error?.message || `HTTP ${status}`;

        if (status === 404) {
          // Model not available for this key — try the next candidate.
          logError(op, `model=${model} not found (404), trying fallback`);
          lastError = new AIError("AI model unavailable. Please try again.", 502);
          break;
        }
        if (status === 401 || status === 403) {
          logError(op, `auth failed (${status}): ${errMsg}`);
          throw new AIError("AI authentication failed. Check GOOGLE_AI_API_KEY in .env.", 503);
        }
        if (status === 429) {
          lastError = new AIError("AI service is rate-limited right now. Wait a few seconds and retry.", 429);
          const hinted = parseRetryDelayMs(data);
          logError(op, `model=${model} rate limited (attempt ${attempt + 1})${hinted ? ` retryDelay=${hinted}ms` : ""}`);
          if (attempt < MAX_RETRIES) {
            // Per-minute quota windows need longer waits than transient errors.
            await sleep(hinted ?? 2_500 * (attempt + 1) + Math.floor(Math.random() * 500));
            continue;
          }
        } else if (status >= 500) {
          lastError = new AIError("AI service is temporarily unavailable. Please retry.", 502);
          logError(op, `model=${model} server error ${status} (attempt ${attempt + 1}): ${errMsg}`);
        } else {
          // 4xx we can't fix by retrying (bad request etc.)
          logError(op, `model=${model} request rejected ${status}: ${errMsg}`);
          throw new AIError(`AI request rejected: ${errMsg}`, 502);
        }
      } catch (err) {
        if (err instanceof AIError) throw err;
        const ms = Date.now() - started;
        const aborted = err instanceof Error && err.name === "AbortError";
        if (aborted) {
          lastError = new AIError("AI request timed out. Please try again.", 504);
          logError(op, `model=${model} timeout after ${ms}ms (attempt ${attempt + 1})`);
        } else {
          lastError = new AIError("Could not reach the AI service. Check your network connection.", 502);
          logError(op, `model=${model} network error (attempt ${attempt + 1}): ${err instanceof Error ? err.message : err}`);
        }
      }

      if (attempt < MAX_RETRIES) {
        const backoff = 600 * Math.pow(2, attempt) + Math.floor(Math.random() * 250);
        await sleep(backoff);
      }
    }
  }

  throw lastError;
}

/** Strip markdown fences / surrounding prose and parse the first JSON value. */
export function parseJsonLoose<T>(text: string): T {
  const direct = text.trim();
  try {
    return JSON.parse(direct) as T;
  } catch {
    /* fall through to extraction */
  }
  const unfenced = direct.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    return JSON.parse(unfenced) as T;
  } catch {
    /* fall through to bracket scan */
  }
  const firstObj = unfenced.indexOf("{");
  const firstArr = unfenced.indexOf("[");
  const start = firstObj === -1 ? firstArr : firstArr === -1 ? firstObj : Math.min(firstObj, firstArr);
  if (start !== -1) {
    const open = unfenced[start];
    const close = open === "{" ? "}" : "]";
    const end = unfenced.lastIndexOf(close);
    if (end > start) {
      return JSON.parse(unfenced.slice(start, end + 1)) as T;
    }
  }
  throw new AIError("AI returned malformed JSON. Please try again.", 502);
}

/** JSON-mode generation: returns the parsed object, with one repair retry. */
export async function generateJSON<T>(opts: GenerateOptions): Promise<{ data: T; model: string }> {
  const { text, model } = await generateText({ ...opts, json: true, temperature: opts.temperature ?? 0.5 });
  try {
    return { data: parseJsonLoose<T>(text), model };
  } catch {
    // One repair pass: ask the model to fix its own output into valid JSON.
    const repaired = await generateText({
      ...opts,
      op: `${opts.op || "generate"}:repair`,
      json: true,
      temperature: 0.1,
      prompt: `The following was supposed to be valid JSON but is malformed. Output ONLY the corrected JSON, nothing else:\n\n${clampText(text, 8_000)}`,
    });
    return { data: parseJsonLoose<T>(repaired.text), model: repaired.model };
  }
}
