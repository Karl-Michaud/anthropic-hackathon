-- CreateTable
CREATE TABLE "prompt_weights" (
    "id" TEXT NOT NULL,
    "weights" JSONB NOT NULL,
    "prompt_id" TEXT NOT NULL,

    CONSTRAINT "prompt_weights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prompt_weights_prompt_id_key" ON "prompt_weights"("prompt_id");

-- AddForeignKey
ALTER TABLE "prompt_weights" ADD CONSTRAINT "prompt_weights_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
