import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const courses = await prisma.course.findMany({ orderBy: { order: "asc" } });
for (const c of courses) {
  const count = await prisma.lesson.count({ where: { courseId: c.id } });
  console.log(`${c.order}. ${c.title.padEnd(15)} slug=${c.slug.padEnd(15)} ${count} lessons`);
}

await prisma.$disconnect();
