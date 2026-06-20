import { PrismaClient } from "@prisma/client";
import { COURSES } from "../curriculum";

const prisma = new PrismaClient({ log: ["warn", "error"] });

async function main() {
  console.log("Seeding courses only (fast)...");

  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();

  for (const course of COURSES) {
    const { lessons, ...courseData } = course;
    const created = await prisma.course.create({ data: courseData });
    console.log(`  Created course: ${created.title}`);

    const lessonData = lessons.map((l) => ({ ...l, courseId: created.id }));
    await prisma.lesson.createMany({ data: lessonData });
    console.log(`  Added ${lessons.length} lessons`);
  }

  console.log("Courses seeded!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
