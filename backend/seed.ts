import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { COURSES } from "./curriculum";
import { calculateLevel } from "./src/services/xp-service";
import { classifyLevel, saveProfile, buildAndSaveRoadmap, type MasteryMap } from "./src/services/learning-service";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data (order matters for foreign keys)
  await prisma.learningEvent.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.skillProfile.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.coursePlacement.deleteMany();
  await prisma.userInventory.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.xpLog.deleteMany();
  await prisma.battleSubmission.deleteMany();
  await prisma.battle.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.shopItem.deleteMany();
  await prisma.skillTreeNode.deleteMany();

  // ==================== COURSES & LESSONS ====================
  // Full curricula live in ./curriculum — 124 authored lessons with
  // topics, difficulty, quiz checkpoints, and estimated minutes.
  for (const course of COURSES) {
    const { lessons, ...courseData } = course;
    const created = await prisma.course.create({
      data: courseData,
    });
    console.log(`  Created course: ${created.title}`);

    for (const lesson of lessons) {
      await prisma.lesson.create({
        data: { ...lesson, courseId: created.id },
      });
    }
    console.log(`  Added ${lessons.length} lessons`);
  }

  // ==================== TEST USERS ====================
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { email: "alice@example.com", username: "alice", passwordHash, xp: 0, level: 1 },
  });

  await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: { email: "bob@example.com", username: "bob", passwordHash, xp: 0, level: 1 },
  });

  console.log("  Created 2 test users (alice, bob)");

  // ==================== DEMO ACCOUNT (mid-progress, for demos) ====================
  // A ready-to-show intermediate Python learner: completed assessment, a real
  // skill profile, a personalized roadmap with skipped lessons, completed
  // lessons on the path, XP history, and a battle win. Login: demo@eduverse.dev / demo1234
  await seedDemoAccount();

  // ==================== SKILL TREE NODES ====================
  const createdNodes: Record<string, string> = {};

  const skillNodesData = [
    // Python Mastery Branch
    {
      name: "Python Basics",
      description: "Unlock +10% XP from Python lessons",
      branch: "python_mastery",
      positionX: 1,
      positionY: 1,
      prerequisites: "[]",
      xpCost: 200,
      levelRequired: 2,
      effectType: "xp_boost",
      effectValue: 0.1,
      effectDesc: "+10% XP from Python lessons",
    },
    {
      name: "Loop Master",
      description: "Unlock +15% XP from Python lessons",
      branch: "python_mastery",
      positionX: 2,
      positionY: 1,
      prerequisites: "Python Basics",
      xpCost: 500,
      levelRequired: 5,
      effectType: "xp_boost",
      effectValue: 0.15,
      effectDesc: "+15% XP from Python lessons",
    },
    {
      name: "Python Guru",
      description: "Unlock +25% XP from Python lessons",
      branch: "python_mastery",
      positionX: 3,
      positionY: 1,
      prerequisites: "Loop Master",
      xpCost: 1000,
      levelRequired: 10,
      effectType: "xp_boost",
      effectValue: 0.25,
      effectDesc: "+25% XP from Python lessons",
    },

    // Frontend Mastery Branch
    {
      name: "HTML Fundamentals",
      description: "+10% XP from HTML/CSS lessons",
      branch: "frontend_mastery",
      positionX: 1,
      positionY: 2,
      prerequisites: "[]",
      xpCost: 200,
      levelRequired: 2,
      effectType: "xp_boost",
      effectValue: 0.1,
      effectDesc: "+10% XP from HTML/CSS lessons",
    },
    {
      name: "CSS Artist",
      description: "+15% XP from CSS lessons",
      branch: "frontend_mastery",
      positionX: 2,
      positionY: 2,
      prerequisites: "HTML Fundamentals",
      xpCost: 500,
      levelRequired: 5,
      effectType: "xp_boost",
      effectValue: 0.15,
      effectDesc: "+15% XP from CSS lessons",
    },
    {
      name: "Frontend Architect",
      description: "+25% XP from frontend lessons",
      branch: "frontend_mastery",
      positionX: 3,
      positionY: 2,
      prerequisites: "CSS Artist",
      xpCost: 1000,
      levelRequired: 10,
      effectType: "xp_boost",
      effectValue: 0.25,
      effectDesc: "+25% XP from frontend lessons",
    },

    // Algorithms Branch
    {
      name: "Sorting Basics",
      description: "+10 battle damage (score boost)",
      branch: "algorithms",
      positionX: 1,
      positionY: 3,
      prerequisites: "[]",
      xpCost: 300,
      levelRequired: 3,
      effectType: "damage_boost",
      effectValue: 10,
      effectDesc: "+10 battle score bonus",
    },
    {
      name: "Search Algorithms",
      description: "+20 battle damage (score boost)",
      branch: "algorithms",
      positionX: 2,
      positionY: 3,
      prerequisites: "Sorting Basics",
      xpCost: 600,
      levelRequired: 6,
      effectType: "damage_boost",
      effectValue: 20,
      effectDesc: "+20 battle score bonus",
    },
    {
      name: "Algorithm Master",
      description: "+50 battle damage (score boost)",
      branch: "algorithms",
      positionX: 3,
      positionY: 3,
      prerequisites: "Search Algorithms",
      xpCost: 1200,
      levelRequired: 12,
      effectType: "damage_boost",
      effectValue: 50,
      effectDesc: "+50 battle score bonus",
    },

    // Debugging Branch
    {
      name: "Bug Hunter",
      description: "Unlock medium-difficulty challenges",
      branch: "debugging",
      positionX: 1,
      positionY: 4,
      prerequisites: "[]",
      xpCost: 200,
      levelRequired: 2,
      effectType: "unlock_challenge",
      effectValue: 1,
      effectDesc: "Unlock medium challenges",
    },
    {
      name: "Code Detective",
      description: "+5% XP from all sources",
      branch: "debugging",
      positionX: 2,
      positionY: 4,
      prerequisites: "Bug Hunter",
      xpCost: 500,
      levelRequired: 5,
      effectType: "xp_boost",
      effectValue: 0.05,
      effectDesc: "+5% XP from all sources",
    },
  ];

  for (const node of skillNodesData) {
    let prereqIds: string[] = [];
    if (node.prerequisites !== "[]") {
      const parentId = createdNodes[node.prerequisites];
      if (parentId) {
        prereqIds = [parentId];
      }
    }
    const created = await prisma.skillTreeNode.create({
      data: {
        ...node,
        prerequisites: JSON.stringify(prereqIds),
      },
    });
    createdNodes[node.name] = created.id;
  }
  console.log(`  Created ${skillNodesData.length} skill tree nodes`);

  // ==================== SHOP ITEMS ====================
  const shopItems = [
    // Avatars
    { name: "Wizard Avatar", type: "avatar", description: "A mystical wizard persona", price: 500, levelRequired: 2, imageUrl: "/avatars/wizard.png" },
    { name: "Knight Avatar", type: "avatar", description: "Brave knight in shining armor", price: 500, levelRequired: 2, imageUrl: "/avatars/knight.png" },
    { name: "Cyborg Avatar", type: "avatar", description: "Half-human, half-machine", price: 800, levelRequired: 4, imageUrl: "/avatars/cyborg.png" },
    { name: "Ninja Avatar", type: "avatar", description: "Stealthy ninja warrior", price: 800, levelRequired: 4, imageUrl: "/avatars/ninja.png" },
    { name: "Mage Avatar", type: "avatar", description: "Powerful mage with arcane powers", price: 1200, levelRequired: 7, imageUrl: "/avatars/mage.png" },

    // Frames
    { name: "Gold Frame", type: "frame", description: "Shiny golden profile frame", price: 300, levelRequired: 1, imageUrl: "/frames/gold.png" },
    { name: "Ruby Frame", type: "frame", description: "Deep red ruby-encrusted frame", price: 600, levelRequired: 3, imageUrl: "/frames/ruby.png" },
    { name: "Obsidian Frame", type: "frame", description: "Dark obsidian crystal frame", price: 600, levelRequired: 3, imageUrl: "/frames/obsidian.png" },
    { name: "Crystal Frame", type: "frame", description: "Ethereal crystal clear frame", price: 1000, levelRequired: 6, imageUrl: "/frames/crystal.png" },
    { name: "Void Frame", type: "frame", description: "Mysterious void-themed frame", price: 1500, levelRequired: 10, imageUrl: "/frames/void.png" },

    // Animations
    { name: "Level-Up Burst", type: "animation", description: "Explosive level-up animation", price: 400, levelRequired: 2, imageUrl: "/animations/levelup.png" },
    { name: "Lightning Strike", type: "animation", description: "Electric lightning effect", price: 700, levelRequired: 4, imageUrl: "/animations/lightning.png" },
    { name: "Aura Glow", type: "animation", description: "Soft glowing aura around profile", price: 1000, levelRequired: 6, imageUrl: "/animations/aura.png" },

    // Titles
    { name: "Code Master", type: "title", description: "Title: Code Master", price: 2000, levelRequired: 15, imageUrl: "/titles/code-master.png" },
    { name: "Bug Hunter", type: "title", description: "Title: Bug Hunter", price: 1500, levelRequired: 10, imageUrl: "/titles/bug-hunter.png" },
    { name: "Algorithm King", type: "title", description: "Title: Algorithm King", price: 2500, levelRequired: 18, imageUrl: "/titles/algorithm-king.png" },

    // Editor Themes
    { name: "Matrix Theme", type: "theme", description: "Green-on-black Matrix editor theme", price: 800, levelRequired: 5, imageUrl: "/themes/matrix.png" },
    { name: "Sunset Theme", type: "theme", description: "Warm sunset-colored editor theme", price: 800, levelRequired: 5, imageUrl: "/themes/sunset.png" },

    // Effects
    { name: "Particle Trail", type: "effect", description: "Particles follow your cursor", price: 600, levelRequired: 3, imageUrl: "/effects/particles.png" },
    { name: "Neon Glow", type: "effect", description: "Neon glow effect on profile", price: 900, levelRequired: 5, imageUrl: "/effects/neon.png" },
  ];

  for (const item of shopItems) {
    await prisma.shopItem.create({ data: item });
  }
  console.log(`  Created ${shopItems.length} shop items`);

  console.log("Seeding complete!");
}

/**
 * Builds a believable intermediate Python learner so the adaptive features
 * (roadmap, skipped lessons, dashboard stats, recent activity) have data to
 * show the instant someone logs in as the demo account.
 */
async function seedDemoAccount() {
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const demo = await prisma.user.upsert({
    where: { email: "demo@eduverse.dev" },
    update: {},
    create: { email: "demo@eduverse.dev", username: "demo", passwordHash, placementLevel: "intermediate" },
  });

  const python = await prisma.course.findUnique({ where: { slug: "python" } });
  if (!python) return;

  // Hand-built intermediate mastery: fundamentals solid, core mixed, advanced thin.
  const mastery: MasteryMap = {
    variables: { status: "mastered", score: 95 }, "data-types": { status: "mastered", score: 90 },
    io: { status: "mastered", score: 88 }, operators: { status: "mastered", score: 92 },
    conditionals: { status: "mastered", score: 90 }, loops: { status: "mastered", score: 85 },
    strings: { status: "mastered", score: 82 },
    functions: { status: "mastered", score: 80 }, lists: { status: "mastered", score: 84 },
    tuples: { status: "partial", score: 60 }, dictionaries: { status: "mastered", score: 78 },
    sets: { status: "partial", score: 55 }, modules: { status: "partial", score: 50 },
    "file-handling": { status: "weak", score: 30 }, exceptions: { status: "partial", score: 58 },
    oop: { status: "weak", score: 35 }, generators: { status: "missing", score: 0 },
    decorators: { status: "missing", score: 0 }, lambdas: { status: "partial", score: 48 },
    apis: { status: "missing", score: 0 }, "advanced-python": { status: "weak", score: 32 },
  };
  const level = classifyLevel("python", mastery); // → intermediate
  const strengths = ["Variables", "Operators", "Loops", "Lists"];
  const weaknesses = ["File Handling", "Object-Oriented Programming", "Generators", "Working with APIs"];

  // Completed placement assessment record (so the course page shows "assessed").
  await prisma.assessment.deleteMany({ where: { userId: demo.id, courseId: python.id } });
  await prisma.assessment.create({
    data: {
      userId: demo.id, courseId: python.id, status: "completed",
      questions: "[]", answers: "[]", score: 16, total: 23, level,
      analysis: JSON.stringify({
        summary: "Strong command of Python fundamentals and core collections. The path ahead focuses on the gaps: file handling, OOP, and the advanced toolkit (generators, decorators, APIs).",
        strengths, weaknesses, scorePct: 70,
      }),
      completedAt: new Date(),
    },
  });

  await saveProfile(demo.id, python.id, level, mastery, strengths, weaknesses);
  // First roadmap pass (no completions yet) so we can see which lessons are required.
  await buildAndSaveRoadmap(demo.id, python.id, "python", mastery, level, null);

  const roadmap = await prisma.roadmap.findUnique({ where: { userId_courseId: { userId: demo.id, courseId: python.id } } });
  const items: { lessonId: string; status: string }[] = roadmap ? JSON.parse(roadmap.items) : [];
  const requiredIds = items.filter((i) => i.status === "required").map((i) => i.lessonId);

  // Complete the first 3 required lessons to show progress along the path.
  let lessonXp = 0;
  for (const lessonId of requiredIds.slice(0, 3)) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) continue;
    await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId: demo.id, lessonId } },
      create: { userId: demo.id, lessonId, completed: true, score: 100 },
      update: { completed: true, score: 100 },
    });
    await prisma.xpLog.create({ data: { userId: demo.id, amount: lesson.xpReward, source: "lesson" } });
    lessonXp += lesson.xpReward;
  }
  // Rebuild so the roadmap reflects the completed lessons.
  await buildAndSaveRoadmap(demo.id, python.id, "python", mastery, level, null);

  // Assessment + a battle win in the activity history.
  await prisma.xpLog.create({ data: { userId: demo.id, amount: 75, source: "placement" } });
  await prisma.xpLog.create({ data: { userId: demo.id, amount: 200, source: "battle" } });

  const totalXp = lessonXp + 75 + 200;
  await prisma.user.update({
    where: { id: demo.id },
    data: { xp: totalXp, level: calculateLevel(totalXp) },
  });

  console.log(`  Created demo account (demo@eduverse.dev / demo1234) — ${level} Python learner, ${totalXp} XP`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
