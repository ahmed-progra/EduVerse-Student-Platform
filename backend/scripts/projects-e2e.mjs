/**
 * End-to-end test of the Project Studio + public Portfolio against a running
 * backend and the live Gemini API.
 *
 *   node scripts/projects-e2e.mjs        (backend on :4000)
 *
 * Flow: fresh user → AI suggests a tailored project → save real code → submit →
 * AI grades it (XP + coins awarded, status completed) → it appears on the PUBLIC
 * portfolio (no auth) → unpublish hides it.
 */

const BASE = process.env.API_BASE || "http://localhost:4000/api";
const STAMP = Date.now().toString(36);
const CREDS = { email: `proj-e2e-${STAMP}@eduverse.dev`, username: `proj_${STAMP}`, password: "test12345" };

let token = "";
let passed = 0;
let failed = 0;

async function call(path, { method = "GET", body, auth = true, timeoutMs = 120_000 } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && token) headers.Authorization = `Bearer ${token}`;
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

// A complete, correct Python solution to the fallback "number guessing game"-style
// brief — good code should grade well regardless of the exact AI brief.
const SOLUTION = `import random

def play():
    secret = random.randint(1, 100)
    tries = 0
    while True:
        guess = int(input("Guess (1-100): "))
        tries += 1
        if guess < secret:
            print("Too low")
        elif guess > secret:
            print("Too high")
        else:
            print(f"Correct! It took {tries} tries.")
            return tries

if __name__ == "__main__":
    play()
`;

async function main() {
  console.log(`Project Studio E2E → ${BASE}\n`);

  let res = await call("/auth/register", { method: "POST", body: CREDS });
  token = res.data?.data?.token || "";
  check("setup: fresh user registered", token.length > 20);

  res = await call("/auth/me");
  const xpBefore = res.data?.data?.xp ?? 0;
  const coinsBefore = res.data?.data?.coins ?? 0;

  // ── AI suggests a tailored project ──
  console.log("  ... AI designing a tailored project (live)");
  res = await call("/projects/suggest", { method: "POST", body: { language: "python" } });
  const project = res.data?.data;
  check("suggest: AI created a python project", res.status === 200 && !!project?.id && project.language === "python", `"${(project?.title || "").slice(0, 50)}"`);
  check("suggest: has a brief + milestones + starter code", (project?.brief?.length || 0) > 20 && Array.isArray(project?.milestones) && project.milestones.length > 0 && (project?.starterCode?.length || 0) > 0, `${project?.milestones?.length} milestones`);
  check("suggest: starts in progress", project?.status === "in_progress");
  const pid = project.id;

  // ── Save real code + tick a milestone ──
  const ms = project.milestones.map((m, i) => ({ text: m.text, done: i === 0 }));
  res = await call(`/projects/${pid}`, { method: "PATCH", body: { code: SOLUTION, milestones: ms } });
  check("save: code + milestone persisted", res.status === 200 && res.data?.data?.code?.includes("random.randint") && res.data.data.milestones[0]?.done === true);

  // ── Negative: submitting with no real code is rejected ──
  res = await call("/projects", { method: "POST", body: { title: "Empty", brief: "nothing yet", language: "python" } });
  const emptyId = res.data?.data?.id;
  await call(`/projects/${emptyId}`, { method: "PATCH", body: { code: "" } }); // clear the starter scaffold
  res = await call(`/projects/${emptyId}/submit`, { method: "POST", body: {} });
  check("guard: project with no code can't be submitted", res.status === 400);

  // ── Submit for AI review ──
  console.log("  ... AI reviewing the submission (live)");
  res = await call(`/projects/${pid}/submit`, { method: "POST", body: {} });
  const graded = res.data?.data;
  check("submit: graded with a score", res.status === 200 && typeof graded?.grade?.score === "number" && graded.grade.score >= 0, `score=${graded?.grade?.score}/100`);
  check("submit: rubric + feedback returned", Array.isArray(graded?.grade?.rubric) && graded.grade.rubric.length > 0 && (graded?.grade?.feedback?.length || 0) > 20);
  check("submit: marked completed", graded?.project?.status === "completed" && !!graded.project.completedAt);
  check("submit: XP awarded for the project", (graded?.grade?.xpAwarded || 0) > 0, `+${graded?.grade?.xpAwarded} XP`);

  // ── XP + coins credited ──
  res = await call("/auth/me");
  const xpAfter = res.data?.data?.xp ?? 0;
  const coinsAfter = res.data?.data?.coins ?? 0;
  check("reward: XP increased", xpAfter > xpBefore, `${xpBefore} → ${xpAfter}`);
  check("reward: coins increased too", coinsAfter > coinsBefore, `${coinsBefore} → ${coinsAfter}`);

  // ── Public portfolio (NO auth) shows the completed project ──
  res = await call(`/projects/portfolio/${CREDS.username}`, { auth: false });
  const portfolio = res.data?.data;
  check("portfolio: public endpoint works without auth", res.status === 200 && portfolio?.user?.username === CREDS.username);
  check("portfolio: lists the completed project", Array.isArray(portfolio?.projects) && portfolio.projects.some((p) => p.id === pid), `${portfolio?.projects?.length} published`);

  // ── Unpublish hides it from the portfolio ──
  await call(`/projects/${pid}/publish`, { method: "PATCH", body: { published: false } });
  res = await call(`/projects/portfolio/${CREDS.username}`, { auth: false });
  check("portfolio: unpublish removes it", !(res.data?.data?.projects || []).some((p) => p.id === pid));

  // ── Auth guard on the studio ──
  const saved = token; token = "";
  res = await call("/projects");
  check("auth: studio endpoints require auth", res.status === 401 || res.status === 403);
  token = saved;

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Suite crashed:", err.message);
  process.exit(1);
});
