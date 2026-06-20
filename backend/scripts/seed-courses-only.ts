import { PrismaClient } from "@prisma/client";
import { COURSES } from "../curriculum";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding courses only...");

  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();

  for (const course of COURSES) {
    const { lessons, ...courseData } = course;
    const created = await prisma.course.create({ data: courseData });
    console.log(`  Created course: ${created.title}`);

    for (const lesson of lessons) {
      await prisma.lesson.create({ data: { ...lesson, courseId: created.id } });
    }
    console.log(`  Added ${lessons.length} lessons`);
  }

  console.log("Courses seeded!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
