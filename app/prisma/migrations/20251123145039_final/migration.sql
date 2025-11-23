-- CreateEnum
CREATE TYPE "ImportanceLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "PrimaryFocus" AS ENUM ('MERIT', 'COMMUNITY', 'INNOVATION', 'LEADERSHIP', 'ACADEMIC_EXCELLENCE', 'EQUITY', 'OTHER');

-- CreateTable
CREATE TABLE "drafts" (
    "id" TEXT NOT NULL,
    "essay" TEXT NOT NULL,
    "scholarship_id" TEXT NOT NULL,
    "user_id" UUID,

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_personalities" (
    "id" TEXT NOT NULL,
    "spirit" TEXT NOT NULL,
    "tone_style" TEXT NOT NULL,
    "values_emphasized" TEXT[],
    "recommended_essay_focus" TEXT NOT NULL,
    "scholarship_id" TEXT NOT NULL,
    "user_id" UUID,

    CONSTRAINT "prompt_personalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_priorities" (
    "id" TEXT NOT NULL,
    "primary_focus" "PrimaryFocus" NOT NULL,
    "priority_weights" JSONB NOT NULL,
    "scholarship_id" TEXT NOT NULL,
    "user_id" UUID,

    CONSTRAINT "prompt_priorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_values" (
    "id" TEXT NOT NULL,
    "values_emphasized" TEXT[],
    "value_definitions" JSONB NOT NULL,
    "evidence_phrases" TEXT[],
    "scholarship_id" TEXT NOT NULL,
    "user_id" UUID,

    CONSTRAINT "prompt_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_weights" (
    "id" TEXT NOT NULL,
    "weights" JSONB NOT NULL,
    "scholarship_id" TEXT NOT NULL,
    "user_id" UUID,

    CONSTRAINT "prompt_weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarships" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "user_id" UUID,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whiteboard_data" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "cells" JSONB NOT NULL DEFAULT '[]',
    "scholarships" JSONB NOT NULL DEFAULT '[]',
    "essays" JSONB NOT NULL DEFAULT '[]',
    "json_outputs" JSONB NOT NULL DEFAULT '[]',
    "block_positions" JSONB NOT NULL DEFAULT '[]',
    "is_first_time_user" BOOLEAN NOT NULL DEFAULT true,
    "user_profile" JSONB,
    "userResponses" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whiteboard_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drafts_id_key" ON "drafts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "drafts_scholarship_id_key" ON "drafts"("scholarship_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_personalities_id_key" ON "prompt_personalities"("id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_personalities_scholarship_id_key" ON "prompt_personalities"("scholarship_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_priorities_id_key" ON "prompt_priorities"("id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_priorities_scholarship_id_key" ON "prompt_priorities"("scholarship_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_values_id_key" ON "prompt_values"("id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_values_scholarship_id_key" ON "prompt_values"("scholarship_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_weights_id_key" ON "prompt_weights"("id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_weights_scholarship_id_key" ON "prompt_weights"("scholarship_id");

-- CreateIndex
CREATE UNIQUE INDEX "scholarships_id_key" ON "scholarships"("id");

-- CreateIndex
CREATE UNIQUE INDEX "whiteboard_data_id_key" ON "whiteboard_data"("id");

-- CreateIndex
CREATE UNIQUE INDEX "whiteboard_data_user_id_key" ON "whiteboard_data"("user_id");

-- AddForeignKey
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_personalities" ADD CONSTRAINT "prompt_personalities_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_priorities" ADD CONSTRAINT "prompt_priorities_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_values" ADD CONSTRAINT "prompt_values_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_weights" ADD CONSTRAINT "prompt_weights_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
