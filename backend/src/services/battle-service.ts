import { prisma } from "../lib/prisma";
import { addXp } from "./xp-service";
import { syncMissionProgress } from "./mentor-service";
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

// Battle challenges are complete stdin -> stdout programs: the player's code
// is run with each test's `input` as stdin and its stdout (trimmed) compared
// to `expectedOutput`. Every expected value below is hand-verified. Each
// difficulty has multiple entries so Hard battles never fall back to Easy.
const CHALLENGES: ChallengeData[] = [
  // ── EASY ──
  {
    id: "sum-two",
    type: "write_function",
    title: "Sum Two Numbers",
    description: "Read two integers, each on its own line, and print their sum.",
    starterCode: "a = int(input())\nb = int(input())\n# print their sum\n",
    solution: "a = int(input())\nb = int(input())\nprint(a + b)",
    testCases: [
      { input: "3\n5", expectedOutput: "8" },
      { input: "-4\n10", expectedOutput: "6" },
      { input: "0\n0", expectedOutput: "0" },
    ],
    difficulty: "easy",
  },
  {
    id: "even-odd",
    type: "write_function",
    title: "Even or Odd",
    description: "Read an integer and print 'even' if it is even, otherwise 'odd'.",
    starterCode: "n = int(input())\n# print 'even' or 'odd'\n",
    solution: "n = int(input())\nprint('even' if n % 2 == 0 else 'odd')",
    testCases: [
      { input: "4", expectedOutput: "even" },
      { input: "7", expectedOutput: "odd" },
      { input: "0", expectedOutput: "even" },
    ],
    difficulty: "easy",
  },
  {
    id: "max-three",
    type: "debug",
    title: "Largest of Three (fix the bug)",
    description:
      "This should print the largest of three space-separated integers, but it's wrong. Fix it.",
    starterCode: "a, b, c = map(int, input().split())\nprint(min(a, b, c))",
    solution: "a, b, c = map(int, input().split())\nprint(max(a, b, c))",
    testCases: [
      { input: "3 9 5", expectedOutput: "9" },
      { input: "10 2 8", expectedOutput: "10" },
      { input: "-1 -7 -3", expectedOutput: "-1" },
    ],
    difficulty: "easy",
  },

  // ── MEDIUM ──
  {
    id: "fizzbuzz",
    type: "write_function",
    title: "FizzBuzz",
    description:
      "Read N. Print 1..N one per line, but 'Fizz' for multiples of 3, 'Buzz' for multiples of 5, and 'FizzBuzz' for multiples of both.",
    starterCode: "n = int(input())\n# loop from 1 to n applying the FizzBuzz rules\n",
    solution:
      "n = int(input())\nfor i in range(1, n + 1):\n    if i % 15 == 0:\n        print('FizzBuzz')\n    elif i % 3 == 0:\n        print('Fizz')\n    elif i % 5 == 0:\n        print('Buzz')\n    else:\n        print(i)",
    testCases: [
      { input: "5", expectedOutput: "1\n2\nFizz\n4\nBuzz" },
      { input: "3", expectedOutput: "1\n2\nFizz" },
    ],
    difficulty: "medium",
  },
  {
    id: "reverse-str",
    type: "write_function",
    title: "Reverse a String",
    description: "Read a line of text and print it reversed.",
    starterCode: "s = input()\n# print s reversed\n",
    solution: "s = input()\nprint(s[::-1])",
    testCases: [
      { input: "hello", expectedOutput: "olleh" },
      { input: "abc", expectedOutput: "cba" },
      { input: "racecar", expectedOutput: "racecar" },
    ],
    difficulty: "medium",
  },
  {
    id: "count-vowels",
    type: "write_function",
    title: "Count Vowels",
    description: "Read a lowercase word and print how many vowels (a, e, i, o, u) it contains.",
    starterCode: "s = input()\n# count the vowels in s\n",
    solution: "s = input()\nprint(sum(1 for ch in s if ch in 'aeiou'))",
    testCases: [
      { input: "education", expectedOutput: "5" },
      { input: "xyz", expectedOutput: "0" },
      { input: "aeiou", expectedOutput: "5" },
    ],
    difficulty: "medium",
  },

  // ── HARD ──
  {
    id: "fib-nth",
    type: "write_function",
    title: "Nth Fibonacci",
    description:
      "Read N and print the Nth Fibonacci number, where fib(1)=1, fib(2)=1, fib(3)=2, and so on.",
    starterCode: "n = int(input())\n# print the nth Fibonacci number\n",
    solution:
      "n = int(input())\na, b = 1, 1\nfor _ in range(n - 1):\n    a, b = b, a + b\nprint(a)",
    testCases: [
      { input: "1", expectedOutput: "1" },
      { input: "7", expectedOutput: "13" },
      { input: "10", expectedOutput: "55" },
    ],
    difficulty: "hard",
  },
  {
    id: "palindrome",
    type: "write_function",
    title: "Palindrome Check",
    description:
      "Read a string and print 'yes' if it reads the same forwards and backwards, otherwise 'no'.",
    starterCode: "s = input()\n# print 'yes' if s is a palindrome, else 'no'\n",
    solution: "s = input()\nprint('yes' if s == s[::-1] else 'no')",
    testCases: [
      { input: "racecar", expectedOutput: "yes" },
      { input: "hello", expectedOutput: "no" },
      { input: "a", expectedOutput: "yes" },
    ],
    difficulty: "hard",
  },
  {
    id: "digital-root",
    type: "write_function",
    title: "Digital Root",
    description:
      "Read a non-negative integer. Repeatedly sum its digits until a single digit remains, then print that digit.",
    starterCode:
      "n = int(input())\n# reduce n to a single digit by summing its digits repeatedly\n",
    solution: "n = int(input())\nwhile n >= 10:\n    n = sum(int(d) for d in str(n))\nprint(n)",
    testCases: [
      { input: "9875", expectedOutput: "2" },
      { input: "12", expectedOutput: "3" },
      { input: "0", expectedOutput: "0" },
    ],
    difficulty: "hard",
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
  timeLimitMs: number,
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
  timeLimitMs: number,
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
      const winnerId =
        p1Score > p2Score ? battle.player1Id : p1Score < p2Score ? battle.player2Id || null : null;

      const xpReward = winnerId ? 200 : 100;

      await prisma.battle.update({
        where: { id: battleId },
        data: { status: "completed", winnerId, xpReward },
      });

      if (winnerId) {
        await addXp(winnerId, xpReward, "battle");
        const loserId = winnerId === battle.player1Id ? battle.player2Id : battle.player1Id;
        if (loserId) await addXp(loserId, 50, "battle");
        await syncMissionProgress(winnerId, { kind: "battle_win", difficulty: battle.difficulty });
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
      if (win)
        await syncMissionProgress(userId, { kind: "battle_win", difficulty: battle.difficulty });

      return { battle, winnerId: win ? userId : null, xpReward };
    }
  }

  return { battle, winnerId: null, xpReward: 0 };
}
