-- DropForeignKey
ALTER TABLE "prompt_hidden_criteria" DROP CONSTRAINT "prompt_hidden_criteria_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "prompt_personalities" DROP CONSTRAINT "prompt_personalities_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "prompt_priorities" DROP CONSTRAINT "prompt_priorities_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "prompt_values" DROP CONSTRAINT "prompt_values_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "prompt_weights" DROP CONSTRAINT "prompt_weights_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "drafts" DROP CONSTRAINT "drafts_prompt_id_fkey";

-- DropIndex
DROP INDEX "prompt_hidden_criteria_prompt_id_key";

-- DropIndex
DROP INDEX "prompt_personalities_prompt_id_key";

-- DropIndex
DROP INDEX "prompt_priorities_prompt_id_key";

-- DropIndex
DROP INDEX "prompt_values_prompt_id_key";

-- DropIndex
DROP INDEX "prompt_weights_prompt_id_key";

-- DropIndex
DROP INDEX "drafts_prompt_id_key";

-- AlterTable
ALTER TABLE "prompt_personalities" DROP COLUMN "prompt_id", ADD COLUMN "scholarship_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "prompt_priorities" DROP COLUMN "prompt_id", ADD COLUMN "scholarship_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "prompt_values" DROP COLUMN "prompt_id", ADD COLUMN "scholarship_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "prompt_weights" DROP COLUMN "prompt_id", ADD COLUMN "scholarship_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "drafts" DROP COLUMN "prompt_id", ADD COLUMN "scholarship_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "prompt_hidden_criteria";

-- DropTable
DROP TABLE "prompts";

-- CreateIndex
CREATE UNIQUE INDEX "prompt_personalities_scholarship_id_key" ON "prompt_personalities"("scholarship_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_priorities_scholarship_id_key" ON "prompt_priorities"("scholarship_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_values_scholarship_id_key" ON "prompt_values"("scholarship_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_weights_scholarship_id_key" ON "prompt_weights"("scholarship_id");

-- CreateIndex
CREATE UNIQUE INDEX "drafts_scholarship_id_key" ON "drafts"("scholarship_id");

-- AddForeignKey
ALTER TABLE "prompt_personalities" ADD CONSTRAINT "prompt_personalities_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_priorities" ADD CONSTRAINT "prompt_priorities_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_values" ADD CONSTRAINT "prompt_values_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_weights" ADD CONSTRAINT "prompt_weights_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
