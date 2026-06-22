/**
 * End-to-end test of the AI Mentor System against a running backend and the
 * live Gemini API.
 *
 *   node scripts/mentor-e2e.mjs        (backend on :4000)
 *
 * Flow: fresh user → mentor profile (AI synthesis) → daily/weekly missions →
 * complete a lesson + pass a quiz → missions auto-advance & pay XP →
 * weekly report → profile-aware chat → force re-sync.
 */

const BASE = process.env.API_BASE || "http://localhost:4000/api";
const STAMP = Date.now().toString(36);
const CREDS = {
  email: `mentor-e2e-${STAMP}@eduverse.dev`,
  username: `mentor_${STAMP}`,
  password: "test12345",
};

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
  try {
    data = await res.json();
  } catch {
    /* empty */
  }
  return { status: res.status, data };
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

const VALID_TYPES = new Set([
  "lesson_complete",
  "quiz_pass",
  "battle_win",
  "topic_mastery",
  "assessment",
  "project",
  "xp_earn",
]);
const sumProgress = (arr) => arr.reduce((a, m) => a + (m.progress || 0), 0);
const missionsValid = (arr) =>
  arr.length > 0 &&
  arr.every(
    (m) =>
      VALID_TYPES.has(m.type) &&
      m.target >= 1 &&
      m.xpReward >= 25 &&
      m.xpReward <= 100 &&
      typeof m.title === "string",
  );

async function main() {
  console.log(`AI Mentor System E2E → ${BASE}\n`);

  // ── Setup ──
  let res = await call("/auth/register", { method: "POST", body: CREDS });
  token = res.data?.data?.token || "";
  check("setup: fresh user registered", token.length > 20);

  res = await call("/courses");
  const python = (res.data?.data || []).find((c) => c.slug === "python");
  check(
    "setup: python course exists",
    !!python && (python.lessons?.length || 0) > 0,
    `${python?.lessons?.length} lessons`,
  );

  res = await call("/auth/me");
  const xpBefore = res.data?.data?.xp ?? 0;

  // ── Mentor profile (live AI synthesis) ──
  console.log("  ... building mentor profile (live AI, may take ~15s)");
  res = await call("/mentor/profile");
  const profile = res.data?.data;
  const profileV1 = profile?.version ?? 0;
  check(
    "profile: AI summary present",
    res.status === 200 && typeof profile?.summary === "string" && profile.summary.length > 20,
    `"${(profile?.summary || "").slice(0, 60)}..."`,
  );
  check(
    "profile: learning-science metrics computed",
    ["slow", "steady", "fast"].includes(profile?.learningSpeed) &&
      typeof profile?.retention === "number" &&
      typeof profile?.momentum === "number",
    `speed=${profile?.learningSpeed} retention=${profile?.retention}% momentum=${profile?.momentum}`,
  );
  check(
    "profile: strengths + weaknesses arrays",
    Array.isArray(profile?.strengths) && Array.isArray(profile?.weaknesses),
  );
  check(
    "profile: recommendations with hrefs",
    Array.isArray(profile?.recommendations) &&
      profile.recommendations.length > 0 &&
      profile.recommendations.every((r) => typeof r.href === "string"),
  );
  check(
    "profile: project suggestions present",
    Array.isArray(profile?.projects) && profile.projects.length > 0,
    `${profile?.projects?.length} ideas`,
  );
  check(
    "profile: metrics snapshot for charting",
    !!profile?.metrics && typeof profile.metrics === "object",
  );

  // ── Missions ──
  console.log("  ... generating daily + weekly missions (live AI)");
  res = await call("/mentor/missions");
  const daily = res.data?.data?.daily || [];
  const weekly = res.data?.data?.weekly || [];
  check("missions: daily set generated & valid", missionsValid(daily), `${daily.length} daily`);
  check("missions: weekly set generated & valid", missionsValid(weekly), `${weekly.length} weekly`);
  check(
    "missions: each has an XP reward (25-100)",
    [...daily, ...weekly].every((m) => m.xpReward >= 25 && m.xpReward <= 100),
  );
  const progressBefore = sumProgress(daily) + sumProgress(weekly);

  // ── Complete a python lesson → auto-track missions + XP ──
  const lessonId = python.lessons[0].id;
  res = await call(`/lessons/${lessonId}/complete`, { method: "POST", body: {} });
  check(
    "lesson: completion awards XP",
    res.status === 200 && (res.data?.data?.xpGained || 0) > 0,
    `+${res.data?.data?.xpGained} XP`,
  );

  // Pass its quiz (reveal answers on a throwaway attempt, then submit them).
  res = await call(`/lessons/${lessonId}`);
  const quiz = res.data?.data?.quiz || [];
  if (quiz.length > 0) {
    res = await call(`/lessons/${lessonId}/quiz`, {
      method: "POST",
      body: { answers: quiz.map(() => 0) },
    });
    const revealed = (res.data?.data?.results || []).map((r) => r.answer);
    res = await call(`/lessons/${lessonId}/quiz`, { method: "POST", body: { answers: revealed } });
    check(
      "quiz: perfect retake passes with XP",
      res.data?.data?.passed === true && (res.data?.data?.xpGained || 0) > 0,
      `+${res.data?.data?.xpGained} XP`,
    );
  } else {
    check("quiz: lesson has a quiz checkpoint", false, "no quiz on first lesson — skipping");
  }

  // ── Missions auto-advanced from the real events (XP integration) ──
  res = await call("/mentor/missions");
  const daily2 = res.data?.data?.daily || [];
  const weekly2 = res.data?.data?.weekly || [];
  const progressAfter = sumProgress(daily2) + sumProgress(weekly2);
  check(
    "missions: auto-advanced after lesson + quiz",
    progressAfter > progressBefore,
    `progress ${progressBefore} → ${progressAfter}`,
  );
  check(
    "missions: same period reused (not regenerated)",
    daily2.length === daily.length && daily2[0]?.id === daily[0]?.id,
  );

  res = await call("/auth/me");
  const xpAfter = res.data?.data?.xp ?? 0;
  check(
    "xp: learner XP increased from activity",
    xpAfter > xpBefore,
    `${xpBefore} → ${xpAfter} XP`,
  );

  // ── Weekly report ──
  console.log("  ... generating weekly report (live AI)");
  res = await call("/mentor/report");
  const report = res.data?.data;
  check(
    "report: narrative present",
    res.status === 200 && typeof report?.narrative === "string" && report.narrative.length > 20,
    `"${(report?.narrative || "").slice(0, 60)}..."`,
  );
  check(
    "report: improved / needsWork / focus arrays",
    Array.isArray(report?.improved) &&
      Array.isArray(report?.needsWork) &&
      Array.isArray(report?.focusAreas),
  );
  check("report: project ideas", Array.isArray(report?.projects) && report.projects.length > 0);

  // ── Profile-aware chat (the "AI memory") ──
  console.log("  ... mentor chat (live AI)");
  res = await call("/mentor/chat", {
    method: "POST",
    body: { message: "What should I focus on next, and why?" },
  });
  check(
    "chat: grounded reply returned",
    res.status === 200 &&
      typeof res.data?.data?.text === "string" &&
      res.data.data.text.length > 20,
    `"${(res.data?.data?.text || "").slice(0, 60)}..."`,
  );

  // ── Force re-sync bumps the profile version ──
  console.log("  ... forcing mentor re-sync (live AI)");
  res = await call("/mentor/sync", { method: "POST", body: {} });
  check(
    "sync: re-synthesis bumps profile version",
    res.status === 200 && (res.data?.data?.version || 0) > profileV1,
    `v${profileV1} → v${res.data?.data?.version}`,
  );

  // ── Auth guard ──
  const saved = token;
  token = "";
  res = await call("/mentor/profile");
  check("auth: mentor endpoints require auth", res.status === 401 || res.status === 403);
  token = saved;

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Suite crashed:", err.message);
  process.exit(1);
});
