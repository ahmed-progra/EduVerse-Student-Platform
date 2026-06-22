/**
 * End-to-end test of Apprentice Mode ("teach the AI") against a running backend
 * and the live Gemini API.
 *
 *   node scripts/apprentice-e2e.mjs        (backend on :4000)
 *
 * Flow: fresh user → topic catalog → start a teaching session with Pip →
 * teach across several turns (understanding should climb) → grade the teaching
 * → XP is awarded and reflected on the account → input guards.
 */

const BASE = process.env.API_BASE || "http://localhost:4000/api";
const STAMP = Date.now().toString(36);
const CREDS = {
  email: `appr-e2e-${STAMP}@eduverse.dev`,
  username: `appr_${STAMP}`,
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

// An accurate, well-structured teaching script for "Loops" — should grade decently.
const LESSON = [
  "A loop lets you repeat a block of code multiple times instead of writing it out by hand. In Python the most common is the for loop, which iterates over a sequence — like a list or a range — running the indented body once for each item.",
  "For example, `for i in range(3): print(i)` prints 0, 1, 2. The range gives you the values and `i` takes each one in turn. A while loop is different: it keeps repeating as long as a condition stays true, so you use it when you don't know the count ahead of time.",
  "Two handy controls inside loops: `break` stops the loop early, and `continue` skips to the next iteration. A common bug is an infinite loop — a while loop whose condition never becomes false — so always make sure something inside changes the condition.",
];

async function main() {
  console.log(`Apprentice Mode E2E → ${BASE}\n`);

  // ── Setup ──
  let res = await call("/auth/register", { method: "POST", body: CREDS });
  token = res.data?.data?.token || "";
  check("setup: fresh user registered", token.length > 20);

  res = await call("/auth/me");
  const xpBefore = res.data?.data?.xp ?? 0;

  // ── Topic catalog ──
  res = await call("/apprentice/topics");
  const courses = res.data?.data?.courses || [];
  const maxTurns = res.data?.data?.maxTurns || 0;
  check(
    "topics: catalog returns courses with topics",
    res.status === 200 && courses.length > 0 && (courses[0].topics?.length || 0) > 0,
    `${courses.length} courses, maxTurns=${maxTurns}`,
  );
  const python = courses.find((c) => c.courseSlug === "python");
  const loops = python?.topics.find((t) => t.key === "loops") || python?.topics[0];

  // ── Guards ──
  res = await call("/apprentice/start", { method: "POST", body: {} });
  check("guard: start requires a topic", res.status === 400);
  res = await call("/apprentice/grade", {
    method: "POST",
    body: { topic: "Loops", turns: [{ role: "apprentice", text: "hi" }] },
  });
  check("guard: grading requires the mentor to have taught something", res.status === 400);

  // ── Start a session ──
  console.log("  ... Pip is meeting you (live AI)");
  res = await call("/apprentice/start", {
    method: "POST",
    body: { topic: loops.label, courseLabel: "Python" },
  });
  const opener = res.data?.data;
  check(
    "start: Pip greets and asks a question",
    res.status === 200 && typeof opener?.say === "string" && opener.say.length > 15,
    `"${(opener?.say || "").slice(0, 60)}..."`,
  );
  check(
    "start: understanding begins low",
    typeof opener?.understanding === "number" && opener.understanding <= 40,
    `understanding=${opener?.understanding}`,
  );

  // ── Teach across turns; understanding should climb ──
  const turns = [{ role: "apprentice", text: opener.say }];
  let lastUnderstanding = opener.understanding ?? 0;
  let finalDone = false;
  for (let i = 0; i < LESSON.length; i++) {
    turns.push({ role: "mentor", text: LESSON[i] });
    console.log(`  ... teaching turn ${i + 1}/${LESSON.length} (live AI)`);
    res = await call("/apprentice/reply", {
      method: "POST",
      body: { topic: loops.label, turns, turnIndex: i },
    });
    const reply = res.data?.data;
    check(
      `reply ${i + 1}: Pip responds in character`,
      res.status === 200 && typeof reply?.say === "string" && reply.say.length > 10,
      `understanding=${reply?.understanding}`,
    );
    turns.push({ role: "apprentice", text: reply.say });
    lastUnderstanding = reply.understanding ?? lastUnderstanding;
    finalDone = reply.done;
  }
  check(
    "teaching: Pip's understanding rose as you taught",
    lastUnderstanding > (opener.understanding ?? 0),
    `${opener.understanding} → ${lastUnderstanding}`,
  );

  // ── Grade ──
  console.log("  ... grading your teaching (live AI)");
  res = await call("/apprentice/grade", {
    method: "POST",
    body: { topic: loops.label, topicKey: loops.key, courseSlug: "python", turns },
  });
  const grade = res.data?.data;
  check(
    "grade: returns clarity/correctness/completeness/overall",
    res.status === 200 &&
      ["clarity", "correctness", "completeness", "overall"].every(
        (k) => typeof grade?.[k] === "number",
      ),
    `overall=${grade?.overall}`,
  );
  check(
    "grade: verdict + strengths + improvements present",
    typeof grade?.verdict === "string" &&
      grade.verdict.length > 10 &&
      Array.isArray(grade?.strengths) &&
      Array.isArray(grade?.improvements),
    `"${(grade?.verdict || "").slice(0, 50)}..."`,
  );
  check("grade: XP awarded for teaching", (grade?.xpAwarded || 0) > 0, `+${grade?.xpAwarded} XP`);
  check(
    "grade: masteryBoosted flag present (false without a prior assessment)",
    typeof grade?.masteryBoosted === "boolean",
    `masteryBoosted=${grade?.masteryBoosted}`,
  );

  // ── XP reflected on the account ──
  res = await call("/auth/me");
  const xpAfter = res.data?.data?.xp ?? 0;
  check(
    "xp: teaching XP credited to the learner",
    xpAfter > xpBefore,
    `${xpBefore} → ${xpAfter} XP`,
  );

  // ── Auth guard ──
  const saved = token;
  token = "";
  res = await call("/apprentice/topics");
  check("auth: apprentice endpoints require auth", res.status === 401 || res.status === 403);
  token = saved;

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Suite crashed:", err.message);
  process.exit(1);
});
