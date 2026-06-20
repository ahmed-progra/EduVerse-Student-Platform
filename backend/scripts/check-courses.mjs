const res = await fetch('http://localhost:4000/api/courses');
const data = await res.json();
for (const c of data) {
  console.log(`${c.title.padEnd(15)} ${c.slug.padEnd(15)} lessons: ${c.lessons?.length || 'N/A'}`);
}
