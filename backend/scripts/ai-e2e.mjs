/**
 * End-to-end test of every AI endpoint against a running backend + live Gemini API.
 *
 *   node scripts/ai-e2e.mjs            (backend must be running on :4000)
 *
 * Covers: happy paths, validation errors, auth, large content, and response shape.
 */

const BASE = process.env.API_BASE || "http://localhost:4000/api";
const CREDS = { email: "ai-e2e-test@eduverse.dev", username: "ai_e2e_tester", password: "test12345" };

let token = "";
let passed = 0;
let failed = 0;

async function call(path, { method = "POST", body, auth = true, timeoutMs = 90_000 } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  const started = Date.now();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const ms = Date.now() - started;
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* leave empty */
  }
  return { status: res.status, data, ms };
}

function check(name, cond, detail = "") {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  console.log(`AI E2E suite → ${BASE}\n`);

  // ── Auth setup ──
  let res = await call("/auth/login", { body: { email: CREDS.email, password: CREDS.password }, auth: false });
  if (res.status !== 200) {
    res = await call("/auth/register", { body: CREDS, auth: false });
  }
  token = res.data?.data?.token || "";
  check("auth: obtained token", token.length > 20);

  // ── Status ──
  res = await call("/ai/status", { method: "GET" });
  check("status: configured=true", res.status === 200 && res.data?.data?.configured === true, JSON.stringify(res.data?.data));

  // ── Auth enforcement ──
  const saved = token;
  token = "";
  res = await call("/ai/mentor", { body: { message: "hi" } });
  check("auth: rejects missing token with 401", res.status === 401);
  token = saved;

  // ── Validation ──
  res = await call("/ai/mentor", { body: {} });
  check("mentor: 400 on missing message", res.status === 400);
  res = await call("/ai/review", { body: { code: "   " } });
  check("review: 400 on empty code", res.status === 400);
  res = await call("/ai/exam/grade", { body: { question: "q" } });
  check("exam/grade: 400 on missing answer", res.status === 400);
  res = await call("/ai/summary", { body: {} });
  check("summary: 400 on missing content", res.status === 400);
  res = await call("/ai/quiz", { body: {} });
  check("quiz: 400 on missing topic and content", res.status === 400);
  res = await call("/ai/explain-error", { body: { code: "x" } });
  check("explain-error: 400 on missing errorMessage", res.status === 400);

  // ── Happy paths (live Gemini) ──
  res = await call("/ai/mentor", { body: { message: "In one sentence: what is a Python list?" } });
  check("mentor: live response", res.status === 200 && (res.data?.data?.text || "").length > 10, `${res.ms}ms model=${res.data?.data?.model}`);

  res = await call("/ai/mentor", {
    body: {
      message: "What number did I just tell you? Answer with the number only.",
      history: [
        { role: "user", text: "Remember this number: 7341." },
        { role: "model", text: "Got it, I'll remember 7341." },
      ],
    },
  });
  check("mentor: uses conversation history", res.status === 200 && (res.data?.data?.text || "").includes("7341"), `got: ${(res.data?.data?.text || "").slice(0, 60)}`);

  res = await call("/ai/review", { body: { code: "def add(a, b):\n    return a - b  # supposed to add", language: "python" } });
  check("review: live response with score", res.status === 200 && /score/i.test(res.data?.data?.text || ""), `${res.ms}ms`);

  res = await call("/ai/hints", { body: { challenge: "Reverse a string in Python without using slicing" } });
  const hints = res.data?.data?.hints;
  check("hints: returns 3 progressive hints", res.status === 200 && Array.isArray(hints) && hints.length === 3, `${res.ms}ms`);

  res = await call("/ai/challenge", { body: { topic: "python lists", difficulty: "easy" } });
  const ch = res.data?.data?.challenge;
  check(
    "challenge: structured JSON (title/description/example)",
    res.status === 200 && ch && ch.title && ch.description && typeof ch.example === "string",
    `${res.ms}ms "${(ch?.title || "").slice(0, 40)}"`
  );

  res = await call("/ai/exam/grade", {
    body: {
      question: "Write a Python function that returns the sum of two numbers.",
      answer: "def add(a, b):\n    return a + b",
      topic: "python",
      difficulty: "easy",
    },
  });
  const grade = res.data?.data;
  check(
    "exam/grade: structured score for correct answer",
    res.status === 200 && typeof grade?.score === "number" && grade.score >= 7 && grade.passed === true,
    `${res.ms}ms score=${grade?.score}/10`
  );

  res = await call("/ai/exam/grade", {
    body: {
      question: "Write a Python function that returns the sum of two numbers.",
      answer: "i dont know",
      topic: "python",
      difficulty: "easy",
    },
  });
  const badGrade = res.data?.data;
  check(
    "exam/grade: low score for wrong answer",
    res.status === 200 && typeof badGrade?.score === "number" && badGrade.score <= 4,
    `score=${badGrade?.score}/10`
  );

  // Large lesson content (~120 KB of HTML) — must clamp, not fail.
  const bigContent =
    "<h1>Loops in Python</h1>" +
    "<p>For loops iterate over sequences. While loops repeat until a condition is false. ".repeat(1500) +
    "</p><pre>for i in range(10): print(i)</pre>";
  res = await call("/ai/summary", { body: { title: "Loops in Python", content: bigContent } });
  const summary = res.data?.data;
  check(
    "summary: handles ~120KB lesson content",
    res.status === 200 && (summary?.summary || "").length > 20 && Array.isArray(summary?.keyPoints) && summary.keyPoints.length >= 3,
    `${res.ms}ms keyPoints=${summary?.keyPoints?.length}`
  );

  res = await call("/ai/quiz", { body: { topic: "Python dictionaries", count: 3 } });
  const qs = res.data?.data?.questions;
  const quizOk =
    res.status === 200 &&
    Array.isArray(qs) &&
    qs.length === 3 &&
    qs.every((q) => q.question && q.options.length >= 2 && q.answerIndex >= 0 && q.answerIndex < q.options.length);
  check("quiz: 3 valid MCQs with answer indices", quizOk, `${res.ms}ms`);

  res = await call("/ai/recommend", { body: {} });
  const recs = res.data?.data?.recommendations;
  check(
    "recommend: 3 personalized recommendations",
    res.status === 200 && Array.isArray(recs) && recs.length === 3 && recs.every((r) => r.title && r.href),
    `${res.ms}ms focus="${(res.data?.data?.focus || "").slice(0, 50)}"`
  );

  res = await call("/ai/explain-error", {
    body: {
      code: "nums = [1, 2, 3]\nprint(nums[5])",
      errorType: "IndexError",
      errorMessage: "list index out of range",
      line: 2,
      language: "python",
    },
  });
  check("explain-error: live diagnosis", res.status === 200 && (res.data?.data?.text || "").length > 30, `${res.ms}ms`);

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Suite crashed:", err.message);
  process.exit(1);
});
