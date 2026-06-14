/**
 * End-to-end test of the Teach-Back loop: the AI Coach assigns a "teach a weak
 * topic to Pip" mission, and completing the apprentice session auto-completes
 * the mission and pays XP.
 *
 *   node scripts/teachback-e2e.mjs        (backend on :4000)
 *
 * Flow: fresh user → assessment (leaves topics weak) → weekly missions include a
 * topic-scoped mission → teach that topic to Pip → mission advances + XP.
 */

const BASE = process.env.API_BASE || "http://localhost:4000/api";
const STAMP = Date.now().toString(36);
const CREDS = { email: `tb-e2e-${STAMP}@eduverse.dev`, username: `tb_${STAMP}`, password: "test12345" };

let token = "";
let passed = 0;
let failed = 0;

async function call(path, { method = "GET", body, timeoutMs = 120_000 } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method, headers,
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

// An empty Python assessment leaves "Variables" as the weakest topic, so we
// teach Variables accurately — good teaching should clear the mission's grade gate.
const LESSON = [
  "A variable is a named container that stores a value in your program. In Python you make one with an assignment like `age = 25` — the name `age` now refers to the value 25, and you can use `age` anywhere you need that value.",
  "Variables can hold different types: `name = \"Sam\"` stores text (a string), `price = 9.99` stores a decimal (a float), and `is_ready = True` stores a boolean. You can reassign any time, e.g. `age = age + 1` updates it to 26.",
  "Good names are descriptive and lowercase with underscores, like `total_score`. A common beginner mistake is using a variable before assigning it, which raises a NameError — always define a variable before you read it.",
];

async function main() {
  console.log(`Teach-Back loop E2E → ${BASE}\n`);

  // ── Setup ──
  let res = await call("/auth/register", { method: "POST", body: CREDS });
  token = res.data?.data?.token || "";
  check("setup: fresh user registered", token.length > 20);

  res = await call("/courses");
  const python = (res.data?.data || []).find((c) => c.slug === "python");
  check("setup: python course exists", !!python);

  // ── Assessment that leaves topics weak (submit no answers) ──
  res = await call(`/learning/${python.id}/assessment/start`, { method: "POST", body: {} });
  const assessmentId = res.data?.data?.assessmentId;
  console.log("  ... submitting an empty assessment (live AI analysis)");
  res = await call(`/learning/${python.id}/assessment/submit`, { method: "POST", body: { assessmentId, answers: {} } });
  check("assessment: completes and produces a profile", res.status === 200 && !!res.data?.data?.level, `level=${res.data?.data?.level}`);

  res = await call("/auth/me");
  const xpBefore = res.data?.data?.xp ?? 0;

  // ── Coach assigns weekly missions; expect a topic-scoped (teach/mastery) one ──
  console.log("  ... generating weekly missions (live AI)");
  res = await call("/mentor/missions/generate?scope=weekly", { method: "POST", body: {} });
  const weekly = res.data?.data?.weekly || [];
  check("missions: weekly set generated", weekly.length > 0, `${weekly.length} missions`);
  const hasTeach = weekly.some((m) => m.type === "teach_back");
  console.log(`        (teach_back present: ${hasTeach}; types: ${weekly.map((m) => m.type).join(", ")})`);
  const teachMission = weekly.find((m) => (m.type === "teach_back" || m.type === "topic_mastery") && m.topicKey);
  check("missions: a topic-scoped mission targets a weak topic", !!teachMission, teachMission ? `${teachMission.type} → ${teachMission.topicKey}` : "none found");
  if (!teachMission) {
    console.log(`\nResult: ${passed} passed, ${failed} failed`);
    process.exit(failed === 0 ? 0 : 1);
  }

  // ── Resolve the topic's label ──
  res = await call("/apprentice/topics");
  const pyTopics = (res.data?.data?.courses || []).find((c) => c.courseSlug === "python")?.topics || [];
  const label = pyTopics.find((t) => t.key === teachMission.topicKey)?.label || teachMission.topicKey;
  const progressBefore = teachMission.progress;

  // ── Teach that exact topic to Pip ──
  console.log(`  ... teaching "${label}" to Pip (live AI)`);
  res = await call("/apprentice/start", { method: "POST", body: { topic: label, courseLabel: "Python" } });
  const turns = [{ role: "apprentice", text: res.data?.data?.say || "Hi!" }];
  for (let i = 0; i < LESSON.length; i++) {
    turns.push({ role: "mentor", text: LESSON[i] });
    res = await call("/apprentice/reply", { method: "POST", body: { topic: label, turns, turnIndex: i } });
    turns.push({ role: "apprentice", text: res.data?.data?.say || "ok" });
  }
  console.log("  ... grading the teach-back (live AI)");
  res = await call("/apprentice/grade", { method: "POST", body: { topic: label, topicKey: teachMission.topicKey, courseSlug: "python", turns } });
  const grade = res.data?.data;
  check("teach: graded with XP awarded", res.status === 200 && (grade?.xpAwarded || 0) > 0, `overall=${grade?.overall} +${grade?.xpAwarded} XP`);

  // ── The assigned mission advanced from the teach-back ──
  res = await call("/mentor/missions");
  const after = (res.data?.data?.weekly || []).find((m) => m.id === teachMission.id);
  check("loop: teaching advanced the assigned mission", !!after && after.progress > progressBefore, `progress ${progressBefore} → ${after?.progress}/${after?.target} (${after?.status})`);

  res = await call("/auth/me");
  const xpAfter = res.data?.data?.xp ?? 0;
  check("xp: teaching credited XP to the learner", xpAfter > xpBefore, `${xpBefore} → ${xpAfter} XP`);

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Suite crashed:", err.message);
  process.exit(1);
});
