-- CreateTable
CREATE TABLE "PublishedQuiz" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "quizType" TEXT NOT NULL,
    "subjectLabel" TEXT NOT NULL DEFAULT '',
    "teacher" TEXT NOT NULL DEFAULT '',
    "instructions" TEXT NOT NULL DEFAULT '',
    "duration" TEXT NOT NULL DEFAULT '',
    "totalMarks" INTEGER NOT NULL DEFAULT 0,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB NOT NULL,
    "questions" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sourceUpdatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PublishedQuiz_subject_quizType_slug_key" ON "PublishedQuiz"("subject", "quizType", "slug");
