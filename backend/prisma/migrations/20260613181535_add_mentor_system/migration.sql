-- CreateTable
CREATE TABLE "MentorProfile" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "summary" TEXT NOT NULL DEFAULT '',
    "motivation" TEXT NOT NULL DEFAULT '',
    "focus" TEXT NOT NULL DEFAULT '',
    "strengths" TEXT NOT NULL DEFAULT '[]',
    "weaknesses" TEXT NOT NULL DEFAULT '[]',
    "insights" TEXT NOT NULL DEFAULT '[]',
    "recommendations" TEXT NOT NULL DEFAULT '[]',
    "projects" TEXT NOT NULL DEFAULT '[]',
    "learningSpeed" TEXT NOT NULL DEFAULT 'steady',
    "retention" INTEGER NOT NULL DEFAULT 0,
    "momentum" INTEGER NOT NULL DEFAULT 0,
    "metrics" TEXT NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 0,
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MentorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rationale" TEXT NOT NULL DEFAULT '',
    "target" INTEGER NOT NULL DEFAULT 1,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "courseSlug" TEXT,
    "topicKey" TEXT,
    "difficulty" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'active',
    "periodKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "Mission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MentorReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "narrative" TEXT NOT NULL DEFAULT '',
    "improved" TEXT NOT NULL DEFAULT '[]',
    "regressed" TEXT NOT NULL DEFAULT '[]',
    "needsWork" TEXT NOT NULL DEFAULT '[]',
    "focusAreas" TEXT NOT NULL DEFAULT '[]',
    "projects" TEXT NOT NULL DEFAULT '[]',
    "metrics" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MentorReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Mission_userId_scope_periodKey_idx" ON "Mission"("userId", "scope", "periodKey");

-- CreateIndex
CREATE UNIQUE INDEX "MentorReport_userId_periodKey_key" ON "MentorReport"("userId", "periodKey");
