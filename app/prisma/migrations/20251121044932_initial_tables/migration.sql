-- CreateEnum
CREATE TYPE "ImportanceLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "PrimaryFocus" AS ENUM ('MERIT', 'COMMUNITY', 'INNOVATION', 'LEADERSHIP', 'ACADEMIC_EXCELLENCE', 'EQUITY', 'OTHER');

-- CreateTable
CREATE TABLE "scholarships" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "prompts" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "scholarship_id" TEXT NOT NULL,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_hidden_criteria" (
    "id" TEXT NOT NULL,
    "scholarship_hidden_criteria_id" TEXT,
    "trait" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "evidence_phrases" TEXT[],
    "importance" "ImportanceLevel" NOT NULL,
    "prompt_id" TEXT NOT NULL,

    CONSTRAINT "prompt_hidden_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_personalities" (
    "id" TEXT NOT NULL,
    "spirit" TEXT NOT NULL,
    "tone_style" TEXT NOT NULL,
    "values_emphasized" TEXT[],
    "recommended_essay_focus" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,

    CONSTRAINT "prompt_personalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_priorities" (
    "id" TEXT NOT NULL,
    "primary_focus" "PrimaryFocus" NOT NULL,
    "priority_weights" JSONB NOT NULL,
    "prompt_id" TEXT NOT NULL,

    CONSTRAINT "prompt_priorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_values" (
    "id" TEXT NOT NULL,
    "values_emphasized" TEXT[],
    "value_definitions" JSONB NOT NULL,
    "evidence_phrases" TEXT[],
    "prompt_id" TEXT NOT NULL,

    CONSTRAINT "prompt_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drafts" (
    "id" TEXT NOT NULL,
    "essay" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scholarships_id_key" ON "scholarships"("id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_hidden_criteria_prompt_id_key" ON "prompt_hidden_criteria"("prompt_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_personalities_prompt_id_key" ON "prompt_personalities"("prompt_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_priorities_prompt_id_key" ON "prompt_priorities"("prompt_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_values_prompt_id_key" ON "prompt_values"("prompt_id");

-- CreateIndex
CREATE UNIQUE INDEX "drafts_prompt_id_key" ON "drafts"("prompt_id");

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_hidden_criteria" ADD CONSTRAINT "prompt_hidden_criteria_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_personalities" ADD CONSTRAINT "prompt_personalities_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_priorities" ADD CONSTRAINT "prompt_priorities_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_values" ADD CONSTRAINT "prompt_values_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
