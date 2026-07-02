# Tools

One-off developer utilities used while authoring EduVerse content and assets.
Nothing in this folder runs at build time or in production — the app and CI do
not reference it. Scripts require Python 3 (and `Pillow` for the canvas script).

## `curriculum-scripts/`

Helpers used to generate and sanity-check the seeded curriculum in
[`backend/curriculum/`](../backend/curriculum/):

| Script             | Purpose                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------- |
| `gen_science3.py`  | Writes `backend/curriculum/science.ts` (final generator; avoids shell-escaping issues). |
| `check_quotes.py`  | Counts `'''` and `"""` occurrences in a file to catch unbalanced triple quotes.         |
| `count_lessons.py` | Counts authored lessons per course file to verify seed totals.                          |

## `generate-canvas.py`

Generates promotional/social imagery for [`assets/`](../assets/) using Pillow.
