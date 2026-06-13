/**
 * End-to-end test of the adaptive learning system against a running backend
 * and the live Gemini API.
 *
 *   node scripts/learning-e2e.mjs        (backend on :4000)
 *
 * Flow: fresh user → assessment gate → simulated intermediate-level answers →
 * AI analysis + roadmap → quiz checkpoint → continuous adaptation → AI refresh.
 */

const BASE = process.env.API_BASE || "http://localhost:4000/api";
const STAMP = Date.now().toString(36);
const CREDS = { email: `learn-e2e-${STAMP}@eduverse.dev`, username: `learn_${STAMP}`, password: "test12345" };

let token = "";
let passed = 0;
let failed = 0;

async function call(path, { method = "GET", body, timeoutMs = 120_000 } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty */ }
  return { status: res.status, data };
}

function check(name, cond, detail = "") {
  if (cond) { passed++; console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`); }
  else { failed++; console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`); }
}

/**
 * Simulated "intermediate" Python learner: solid on fundamentals and core
 * collections, shaky on advanced topics, reasonable first code task.
 * Keys must match assessment-banks.ts ids; values are option indexes.
 */
const INTERMEDIATE_ANSWERS = {
  "py-var": 2, "py-types": 1, "py-io": 1, "py-ops": 0, "py-cond": 1,
  "py-loop": 0, "py-str": 0, "py-func": 0, "py-list": 1, "py-tup": 1,
  "py-dict": 0, "py-set": 0, "py-mod": 1, "py-file": 1, "py-exc": 2,
  // advanced: wrong or skipped
  "py-oop": 0,          // wrong
  "py-gen": null,        // skipped
  "py-dec": 0,           // wrong
  "py-lam": null,        // skipped
  "py-api": 0,           // wrong
  "py-adv": 0,           // right (comprehensions)
  "py-code1": `def count_evens(numbers):\n    count = 0\n    for n in numbers:\n        if n % 2 == 0:\n            count += 1\n    return count\n\nprint(count_evens([3, 8, 12, 7, 4]))`,
  "py-code2": "",       // not attempted
};

async function main() {
  console.log(`Adaptive learning E2E → ${BASE}\n`);

  // ── Setup ──
  let res = await call("/auth/register", { method: "POST", body: CREDS });
  token = res.data?.data?.token || "";
  check("setup: fresh user registered", token.length > 20);

  res = await call("/courses");
  const python = (res.data?.data || []).find((c) => c.slug === "python");
  check("setup: python course exists with expanded curriculum", !!python && python.lessons.length >= 36, `${python?.lessons?.length} lessons`);
  const courseId = python.id;

  // ── Gate: state before assessment ──
  res = await call(`/learning/${courseId}/state`);
  check("state: not assessed before placement", res.status === 200 && res.data?.data?.assessed === false, `questions=${res.data?.data?.questionCount}`);

  // ── Negative: submit without starting ──
  res = await call(`/learning/${courseId}/assessment/submit`, { method: "POST", body: { assessmentId: "nope", answers: {} } });
  check("submit: rejects unknown session", res.status === 404);

  // ── Start ──
  res = await call(`/learning/${courseId}/assessment/start`, { method: "POST", body: {} });
  const assessmentId = res.data?.data?.assessmentId;
  const questions = res.data?.data?.questions || [];
  check("start: returns questions + session id", res.status === 200 && !!assessmentId && questions.length >= 20, `${questions.length} questions`);
  check("start: answers are NOT leaked to the client", questions.every((q) => q.answer === undefined));
  check("start: includes mcq, predict, and code types", ["mcq", "predict", "code"].every((t) => questions.some((q) => q.type === t)));

  // ── Submit (live AI: code grading + analysis + roadmap reasons) ──
  console.log("  ... submitting (live AI grading + analysis, may take ~20s)");
  res = await call(`/learning/${courseId}/assessment/submit`, {
    method: "POST",
    body: { assessmentId, answers: INTERMEDIATE_ANSWERS },
  });
  const sub = res.data?.data;
  check("submit: succeeds with level classification", res.status === 200 && ["beginner", "intermediate", "advanced"].includes(sub?.level), `level=${sub?.level} score=${sub?.scorePct}%`);
  check("submit: topic mastery covers all 21 Python topics", sub && Object.keys(sub.mastery || {}).length === 21);
  check("submit: mastered + missing topics identified", Array.isArray(sub?.masteredTopics) && sub.masteredTopics.length > 0 && Array.isArray(sub?.missingTopics) && sub.missingTopics.length > 0, `mastered=${sub?.masteredTopics?.length} gaps=${sub?.missingTopics?.length}`);
  check("submit: AI summary present", typeof sub?.summary === "string" && sub.summary.length > 30, `"${(sub?.summary || "").slice(0, 70)}..."`);
  check("submit: strengths + weaknesses listed", (sub?.strengths?.length || 0) > 0 && (sub?.weaknesses?.length || 0) > 0);
  check("submit: code task got AI feedback", typeof sub?.codeFeedback?.["py-code1"] === "string" && sub.codeFeedback["py-code1"].length > 5, `"${(sub?.codeFeedback?.["py-code1"] || "").slice(0, 60)}..."`);
  check("submit: awarded placement XP", (sub?.xp?.xpGained || 0) > 0, `+${sub?.xp?.xpGained} XP`);

  const roadmap = sub?.roadmap;
  const skipped = (roadmap?.items || []).filter((i) => i.status === "skipped");
  const required = (roadmap?.items || []).filter((i) => i.status === "required");
  check("roadmap: generated with required + skipped lessons", required.length > 0, `${required.length} required, ${skipped.length} skipped`);
  check("roadmap: intermediate+ learner skips mastered lessons", sub?.level === "beginner" ? skipped.length === 0 : skipped.length > 0);
  check("roadmap: EVERY skipped lesson has a justification", skipped.every((i) => typeof i.reason === "string" && i.reason.length > 10), skipped[0] ? `"${skipped[0].reason.slice(0, 60)}..."` : "");
  check("roadmap: estimated completion time computed", (roadmap?.estMinutes || 0) > 0, `~${roadmap?.estMinutes} min`);

  // ── State after ──
  res = await call(`/learning/${courseId}/state`);
  const st = res.data?.data;
  check("state: assessed with persisted profile + roadmap", st?.assessed === true && !!st?.profile && !!st?.roadmap, `profile level=${st?.profile?.level} v${st?.roadmap?.version}`);
  const versionBefore = st?.roadmap?.version || 1;

  // ── Quiz checkpoint flow ──
  const firstRequired = (st?.roadmap?.items || []).find((i) => i.status === "required");
  res = await call(`/lessons/${firstRequired.lessonId}`);
  const lesson = res.data?.data;
  check("lesson: serves quiz without answers", Array.isArray(lesson?.quiz) && lesson.quiz.length >= 2 && lesson.quiz.every((q) => q.answer === undefined), `${lesson?.quiz?.length} questions`);

  // First attempt: all zeros (probably imperfect)
  res = await call(`/lessons/${firstRequired.lessonId}/quiz`, { method: "POST", body: { answers: lesson.quiz.map(() => 0) } });
  const quiz1 = res.data?.data;
  check("quiz: graded server-side with explanations", res.status === 200 && Array.isArray(quiz1?.results) && quiz1.results.every((r) => typeof r.explain === "string"), `${quiz1?.correct}/${quiz1?.total}`);

  // Second attempt: use revealed answers → must pass
  res = await call(`/lessons/${firstRequired.lessonId}/quiz`, { method: "POST", body: { answers: quiz1.results.map((r) => r.answer) } });
  const quiz2 = res.data?.data;
  check("quiz: perfect retake passes with XP", quiz2?.passed === true && quiz2.pct === 100 && quiz2.xpGained > 0, `+${quiz2?.xpGained} XP`);

  // Wrong answer count rejected
  res = await call(`/lessons/${firstRequired.lessonId}/quiz`, { method: "POST", body: { answers: [0] } });
  check("quiz: rejects wrong answer count", res.status === 400);

  // ── Continuous adaptation: profile/roadmap updated after quiz ──
  res = await call(`/learning/${courseId}/state`);
  const st2 = res.data?.data;
  check("adaptation: roadmap version advanced after quiz events", (st2?.roadmap?.version || 0) > versionBefore, `v${versionBefore} → v${st2?.roadmap?.version}`);

  // ── Lesson completion feeds adaptation too ──
  res = await call(`/lessons/${firstRequired.lessonId}/complete`, { method: "POST", body: {} });
  check("complete: lesson completion awards XP", res.status === 200 && (res.data?.data?.xpGained || 0) > 0, `+${res.data?.data?.xpGained} XP`);
  res = await call(`/learning/${courseId}/state`);
  const st3 = res.data?.data;
  const completedInRoadmap = (st3?.roadmap?.items || []).find((i) => i.lessonId === firstRequired.lessonId)?.completed;
  check("adaptation: roadmap reflects completed lesson", completedInRoadmap === true);

  // ── AI refresh (continuous adaptation, full re-analysis) ──
  console.log("  ... AI roadmap refresh (live)");
  res = await call(`/learning/${courseId}/refresh`, { method: "POST", body: {} });
  const ref = res.data?.data;
  check("refresh: AI re-analysis returns updated plan", res.status === 200 && ["beginner", "intermediate", "advanced"].includes(ref?.level) && (ref?.roadmap?.items?.length || 0) > 0, `level=${ref?.level} "${(ref?.summary || "").slice(0, 50)}..."`);

  // ── HTML course also gated ──
  res = await call("/courses");
  const html = (res.data?.data || []).find((c) => c.slug === "html");
  res = await call(`/learning/${html.id}/state`);
  check("multi-course: HTML has its own independent gate", res.status === 200 && res.data?.data?.assessed === false && res.data?.data?.questionCount > 0, `${res.data?.data?.questionCount} questions`);

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Suite crashed:", err.message);
  process.exit(1);
});
