-- AlterTable
ALTER TABLE "UsageRecord" ADD COLUMN     "cost" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ModelPricing" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputPricePerMil" DOUBLE PRECISION NOT NULL,
    "outputPricePerMil" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ModelPricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelPricing_model_key" ON "ModelPricing"("model");
