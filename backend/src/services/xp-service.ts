import { prisma } from "../lib/prisma";

export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export async function addXp(
  userId: string,
  amount: number,
  source: "lesson" | "battle" | "challenge"
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const newXp = user.xp + amount;
  const newLevel = calculateLevel(newXp);

  await prisma.user.update({
    where: { id: userId },
    data: { xp: newXp, level: newLevel },
  });

  await prisma.xpLog.create({
    data: { userId, amount, source },
  });

  const higherRanked = await prisma.leaderboardEntry.count({
    where: { score: { gt: newXp } },
  });

  await prisma.leaderboardEntry.upsert({
    where: { userId },
    create: {
      userId,
      score: newXp,
      weekStart: getWeekStart(),
      rank: higherRanked + 1,
    },
    update: {
      score: newXp,
      weekStart: getWeekStart(),
      rank: higherRanked + 1,
    },
  });

  const leveledUp = newLevel > user.level;

  return { xp: newXp, level: newLevel, leveledUp, xpGained: amount };
}
