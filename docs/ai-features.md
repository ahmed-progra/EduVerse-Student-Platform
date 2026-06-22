# AI Features

EduVerse integrates **Google AI Studio (Gemini API)** across multiple features.
All AI requests flow through a centralized gateway service with retry logic,
model fallback, and deterministic fallback behavior.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend Components                        │
│  /mentor · /apprentice · /projects · /lessons · /codelab    │
│  /battle · /placement-test                                   │
└──────────┬───────────────────────────────────────────────────┘
           │ HTTP REST
           ▼
┌──────────────────────────────────────────────────────────────┐
│                    Backend Routes                             │
│  routes/ai.ts · routes/mentor.ts · routes/apprentice.ts      │
│  routes/projects.ts · routes/learning.ts                     │
└──────────┬───────────────────────────────────────────────────┘
           │ delegation
           ▼
┌──────────────────────────────────────────────────────────────┐
│                services/ai-service.ts                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ generateText│  │ generateJSON │  │ parseJsonLoose     │  │
│  │ (plain text)│  │ (structured) │  │ (lenient parser)   │  │
│  └──────┬──────┘  └──────┬───────┘  └────────────────────┘  │
│         │                │                                    │
│         ▼                ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Retry (3x, exponential backoff)                      │   │
│  │  Model fallback: 2.5-flash → 2.0-flash → flash-latest│   │
│  │  Input clamping (prevents oversized payloads)         │   │
│  │  Structured logging (every call + failure)            │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────┬───────────────────────────────────────────────────┘
           │ HTTPS
           ▼
┌──────────────────────────────────────────────────────────────┐
│              Google AI Studio (Gemini API)                    │
│  gemini-2.5-flash (default)                                   │
│  gemini-2.0-flash (fallback)                                  │
│  gemini-*-flash-latest (last resort)                          │
└──────────────────────────────────────────────────────────────┘
```

---

## AI Service (`services/ai-service.ts`)

### Exported Functions

| Function                         | Description                                                             |
| -------------------------------- | ----------------------------------------------------------------------- |
| `generateText(prompt, options?)` | Send a prompt and receive plain text response                           |
| `generateJSON(prompt, options?)` | Send a prompt and receive structured JSON                               |
| `parseJsonLoose(text)`           | Extract and parse JSON from model output (handles markdown code blocks) |
| `clampText(text, maxChars)`      | Truncate text to fit within model context limits                        |

### Configuration

| Environment Variable | Default            | Description                             |
| -------------------- | ------------------ | --------------------------------------- |
| `GOOGLE_AI_API_KEY`  | —                  | API key for Google AI Studio (required) |
| `GOOGLE_AI_MODEL`    | `gemini-2.5-flash` | Override the default model              |

### Error Handling

- Retries up to 3 times with exponential backoff
- Falls through model versions on transient API errors
- Logs every call and failure with structured metadata
- Returns deterministic fallback values for graceful degradation

---

## AI-Powered Features

### 1. AI Mentor (`/mentor`)

The AI Mentor is a persistent, cross-course coaching system.

**Backend**: `services/mentor-service.ts`

- Gathers signals from all courses (completed lessons, quiz scores, battle wins)
- Builds a `MentorProfile` with strengths, weaknesses, learning speed, retention, momentum
- Generates daily/weekly missions tailored to knowledge gaps
- Produces weekly `MentorReport` with narrative, improvement areas, focus recommendations
- Profile-aware chat grounded in actual learner activity

**Endpoints**: `/api/mentor/*`

### 2. Apprentice Teaching (`/apprentice`)

The "protégé effect" feature — learners teach a novice AI named Pip.

**Backend**: `services/apprentice-service.ts`

- `apprenticeStart(topic, user)` — Initializes a teaching session
- `apprenticeReply(conversation, user)` — Pip responds as a curious beginner
- `gradeTeaching(conversation, topic, user)` — Evaluates teaching quality and awards XP

**Endpoints**: `/api/apprentice/*`

### 3. Project Studio (`/projects`)

AI-powered project suggestions and grading.

**Backend**: `services/project-service.ts`

- `suggestProject(user)` — Generates a project idea appropriate to the learner's level
- `gradeProject(project, user)` — Evaluates code against a rubric, assigns score, provides feedback

**Endpoints**: `/api/projects/*`

### 4. Adaptive Learning (`/placement-test`, courses)

AI-enhanced placement assessment and roadmap generation.

**Backend**: `services/learning-service.ts`

- Assessment analysis identifies topic mastery levels
- Generates personalized roadmap with skip/recommend rationale
- Continuous adaptation as the learner progresses

**Endpoints**: `/api/learning/*`

### 5. Lesson & Code Lab AI Tools

**Route**: `routes/ai.ts` — lower-level AI utilities:

| Endpoint                     | Function                          |
| ---------------------------- | --------------------------------- |
| `POST /api/ai/mentor`        | Multi-turn mentor chat            |
| `POST /api/ai/review`        | Code review with suggestions      |
| `POST /api/ai/hints`         | Progressive hints for a challenge |
| `POST /api/ai/challenge`     | Generate a coding challenge       |
| `POST /api/ai/exam/grade`    | Grade an exam answer              |
| `POST /api/ai/summary`       | Generate lesson summary           |
| `POST /api/ai/quiz`          | Generate practice quiz            |
| `POST /api/ai/recommend`     | Personalized recommendations      |
| `POST /api/ai/explain-error` | Explain a runtime error           |

---

## Fallback Behavior

Every AI feature has a **deterministic fallback** when the API is unavailable:

| Feature             | Fallback                                     |
| ------------------- | -------------------------------------------- |
| Mentor chat         | Canned responses based on detected keywords  |
| Missions            | Rule-based missions from topic catalog       |
| Project grading     | Template-based score calculation             |
| Assessment analysis | Rule-based topic mapping                     |
| Code review         | Static analysis with common pattern matching |

This ensures the platform remains functional even during API outages or
quota exhaustion.

---

## Rate Limiting

AI endpoints are rate-limited to **30 requests per minute** per user.
This covers both the AI route group and all mentor/apprentice/project AI calls.
