import { prisma } from "../lib/prisma";
import { addXp } from "./xp-service";
import { executeCode } from "./judge0";

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface ChallengeData {
  id: string;
  type: string;
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  difficulty: string;
}

const CHALLENGES: ChallengeData[] = [
  {
    id: "debug-001",
    type: "debug",
    title: "Fix the Sum Function",
    description: "The function should return the sum of two numbers, but there's a bug.",
    starterCode: "def add(a, b):\n    return a - b",
    solution: "def add(a, b):\n    return a + b",
    testCases: [
      { input: "3\n5", expectedOutput: "8" },
      { input: "-1\n1", expectedOutput: "0" },
    ],
    difficulty: "easy",
  },
  {
    id: "write-001",
    type: "write_function",
    title: "Check Even or Odd",
    description: "Write a function that returns 'even' if the number is even, 'odd' otherwise.",
    starterCode: "def check_even_odd(n):\n    # Write your code here\n    pass",
    solution: "def check_even_odd(n):\n    return 'even' if n % 2 == 0 else 'odd'",
    testCases: [
      { input: "4", expectedOutput: "even" },
      { input: "7", expectedOutput: "odd" },
    ],
    difficulty: "easy",
  },
  {
    id: "predict-001",
    type: "predict_output",
    title: "What does this print?",
    description: "What will be the output of this code?",
    starterCode: "x = 5\ny = 3\nprint(x * y + 2)",
    solution: "17",
    testCases: [{ input: "", expectedOutput: "17" }],
    difficulty: "easy",
  },
  {
    id: "debug-002",
    type: "debug",
    title: "Fix the Loop",
    description: "This function should count from 1 to n. Fix the bug.",
    starterCode: "def count_up(n):\n    for i in range(n):\n        print(i)",
    solution: "def count_up(n):\n    for i in range(1, n + 1):\n        print(i)",
    testCases: [
      { input: "3", expectedOutput: "1\n2\n3" },
    ],
    difficulty: "medium",
  },
];

export function getRandomChallenge(difficulty: string): ChallengeData {
  const pool = CHALLENGES.filter((c) => c.difficulty === difficulty);
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] || CHALLENGES[0];
}

export async function calculateBattleScore(
  code: string,
  challenge: ChallengeData,
  timeTakenMs: number,
  timeLimitMs: number
): Promise<number> {
  let passed = 0;
  for (const tc of challenge.testCases) {
    const result = await executeCode(code, "python", tc.input);
    if (result.stdout?.trim() === tc.expectedOutput.trim()) {
      passed++;
    }
  }

  const correctness = challenge.testCases.length > 0 ? passed / challenge.testCases.length : 0;
  const timeRatio = Math.max(0, 1 - timeTakenMs / timeLimitMs);

  return Math.round(100 * (0.7 * correctness + 0.3 * timeRatio));
}

export async function createBattle(player1Id: string, difficulty: string, timeLimit: number) {
  const challenge = getRandomChallenge(difficulty);

  const battle = await prisma.battle.create({
    data: {
      player1Id,
      difficulty,
      timeLimit,
      challenge: JSON.stringify(challenge),
      status: "active",
    },
  });

  return battle;
}

export async function joinBattle(battleId: string, player2Id: string) {
  const battle = await prisma.battle.findUnique({ where: { id: battleId } });
  if (!battle) throw new Error("Battle not found");
  if (battle.status !== "waiting") throw new Error("Battle already started");

  return prisma.battle.update({
    where: { id: battleId },
    data: { player2Id, status: "active" },
  });
}

export async function submitBattleSolution(
  battleId: string,
  userId: string,
  code: string,
  timeTakenMs: number,
  timeLimitMs: number
) {
  const battle = await prisma.battle.findUnique({ where: { id: battleId } });
  if (!battle) throw new Error("Battle not found");

  const challenge = JSON.parse(battle.challenge) as ChallengeData;
  const score = await calculateBattleScore(code, challenge, timeTakenMs, timeLimitMs);

  const existing = await prisma.battleSubmission.findFirst({
    where: { battleId, userId },
  });

  if (existing) {
    await prisma.battleSubmission.update({
      where: { id: existing.id },
      data: { code, score },
    });
  } else {
    await prisma.battleSubmission.create({
      data: { battleId, userId, code, score },
    });
  }

  const submissions = await prisma.battleSubmission.findMany({
    where: { battleId },
  });

  if (!battle.winnerId) {
    if (battle.player2Id && submissions.length === 2) {
      const p1Score = submissions.find((s) => s.userId === battle.player1Id)?.score || 0;
      const p2Score = submissions.find((s) => s.userId === battle.player2Id)?.score || 0;
      const winnerId = p1Score > p2Score ? battle.player1Id : p1Score < p2Score ? (battle.player2Id || null) : null;

      const xpReward = winnerId ? 200 : 100;

      await prisma.battle.update({
        where: { id: battleId },
        data: { status: "completed", winnerId, xpReward },
      });

      if (winnerId) {
        await addXp(winnerId, xpReward, "battle");
        const loserId = winnerId === battle.player1Id ? battle.player2Id : battle.player1Id;
        if (loserId) await addXp(loserId, 50, "battle");
      } else {
        await addXp(battle.player1Id, 50, "battle");
        await addXp(battle.player2Id!, 50, "battle");
      }

      return { battle, winnerId, xpReward };
    }

    if (!battle.player2Id) {
      const win = score >= 50;
      const xpReward = win ? 200 : 50;

      await prisma.battle.update({
        where: { id: battleId },
        data: {
          status: "completed",
          winnerId: win ? userId : null,
          xpReward,
        },
      });

      await addXp(userId, xpReward, "battle");

      return { battle, winnerId: win ? userId : null, xpReward };
    }
  }

  return { battle, winnerId: null, xpReward: 0 };
}
