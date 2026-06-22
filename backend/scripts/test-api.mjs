const res = await fetch("http://localhost:4000/api/courses", {
  headers: { Authorization: "Bearer dev-test-token" },
});
console.log("Status:", res.status);
const body = await res.json();
console.log("Success:", body.success);
if (body.data) {
  for (const c of body.data) {
    console.log(`${c.order}. ${c.title} - ${(c.lessons || []).length} lessons`);
  }
} else {
  console.log("Response:", JSON.stringify(body).slice(0, 200));
}
