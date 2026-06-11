# Graph Report - .  (2026-06-11)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 332 nodes · 578 edges · 30 communities (28 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c4fd9035`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 21 edges
2. `api` - 19 edges
3. `Visualizer` - 18 edges
4. `GlassCard` - 14 edges
5. `requireAuth()` - 13 edges
6. `Canvas` - 12 edges
7. `addXp()` - 8 edges
8. `getPythonContent()` - 7 edges
9. `getHtmlContent()` - 7 edges
10. `getCssContent()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `DashboardPage()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/src/app/dashboard/page.tsx → frontend/src/stores/auth-store.ts
- `LessonPage()` --calls--> `useAuthStore`  [INFERRED]
  frontend/src/app/lessons/[id]/page.tsx → frontend/src/stores/auth-store.ts
- `ShopPage()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/src/app/shop/page.tsx → frontend/src/stores/auth-store.ts
- `LoginPage()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/src/app/auth/login/page.tsx → frontend/src/stores/auth-store.ts
- `RegisterPage()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/src/app/auth/register/page.tsx → frontend/src/stores/auth-store.ts

## Import Cycles
- None detected.

## Communities (30 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (42): signToken(), verifyToken(), globalForPrisma, validAvatar(), validBio(), validEmail(), validPassword(), validUsername() (+34 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (15): LessonData, ChallengePanel(), ExamPanel(), HintsPanel(), AIMentorPanel(), AIPanelShell(), CodeReviewPanel(), AppLayout() (+7 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (26): BUG_MUTATIONS, PRESETS, Visualizer, ASTNodeData, ASTViewer, ASTViewerProps, buildASTTree(), extractProps() (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (25): ApiResponse, AuthResponse, Battle, BattleDifficulty, BattleStatus, BattleSubmission, Challenge, ChallengeType (+17 more)

### Community 4 - "Community 4"
Cohesion: 0.21
Nodes (21): codeBlock(), esc(), genConcepts(), generateCppLessons(), generateCssLessons(), generateHtmlLessons(), generateLessonContent(), generatePythonLessons() (+13 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (8): challengeData, diffLabel, features, LandingPage(), steps, CODE, Step, STEPS

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (10): LessonPage(), LeaderboardEntry, LeaderboardPage(), RankInfo, LoginPage(), ProfilePage(), RegisterPage(), AuthState (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.23
Nodes (6): classNames(), PlacementResult, QuestionData, GlassCard, GlassCardProps, GradientButtonProps

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (7): BattleEntry, DashboardPage(), ProfileData, sourceIcons, XpLogEntry, getStreak(), updateStreak()

### Community 10 - "Community 10"
Cohesion: 0.20
Nodes (3): ProfileData, tierBadgeColors, tierColors

### Community 11 - "Community 11"
Cohesion: 0.22
Nodes (7): cppQuestions, cssQuestions, getQuestionsForCourse(), htmlQuestions, PlacementQuestion, pythonQuestions, questionBanks

### Community 12 - "Community 12"
Cohesion: 0.39
Nodes (5): calculateLevel(), xpForCurrentLevel(), xpForNextLevel(), xpProgress(), XpBarProps

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (6): BRANCH_COLORS, BRANCH_NAMES, getExample(), NODE_EXAMPLES, SkillNode, SkillTreePage()

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (4): display, metadata, mono, sans

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (5): BattleChallenge, BattleEntry, BattlePage(), BattleResult, formatTime()

### Community 17 - "Community 17"
Cohesion: 0.33
Nodes (4): CourseData, CourseLesson, PlacementData, tiers

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (5): InventoryItem, ShopItem, ShopPage(), TYPE_ICONS, XpBar

### Community 19 - "Community 19"
Cohesion: 0.40
Nodes (4): CHALLENGE_CATEGORIES, FeatureCard, HERO_STATS, INTEGRATIONS

## Knowledge Gaps
- **115 isolated node(s):** `prisma`, `pythonContent`, `app`, `globalForPrisma`, `Request` (+110 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Visualizer` connect `Community 2` to `Community 8`, `Community 1`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `api` connect `Community 1` to `Community 2`, `Community 6`, `Community 8`, `Community 9`, `Community 10`, `Community 13`, `Community 15`, `Community 16`, `Community 17`, `Community 18`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `Community 6` to `Community 1`, `Community 8`, `Community 9`, `Community 10`, `Community 13`, `Community 15`, `Community 18`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `prisma`, `pythonContent`, `app` to the rest of the system?**
  _115 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06298076923076923 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11051693404634581 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09803921568627451 - nodes in this community are weakly interconnected._