-- CreateEnum
CREATE TYPE "HypothesisStatus" AS ENUM ('CANDIDATE', 'PLAUSIBLE', 'LEADING', 'WEAKENED', 'INVALIDATED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "EvidenceSourceType" AS ENUM ('METRIC', 'LOG', 'TRACE', 'DEPLOYMENT', 'CHANGE', 'RUNTIME_STATE', 'ALERT', 'TOPOLOGY', 'INCIDENT_HISTORY', 'RUNBOOK', 'HUMAN_OBSERVATION');

-- CreateEnum
CREATE TYPE "EvidenceRelationType" AS ENUM ('SUPPORTS', 'CONTRADICTS', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "ContradictionSeverity" AS ENUM ('WEAK', 'MODERATE', 'STRONG', 'INVALIDATING');

-- AlterTable
ALTER TABLE "Investigation" ADD COLUMN     "evidenceSequence" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hypothesisSequence" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Hypothesis" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "status" "HypothesisStatus" NOT NULL DEFAULT 'CANDIDATE',
    "supportStrength" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contradictionPressure" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "independentEvidenceGroups" INTEGER NOT NULL DEFAULT 0,
    "unresolvedContradictions" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hypothesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceType" "EvidenceSourceType" NOT NULL,
    "observation" TEXT NOT NULL,
    "reliability" DOUBLE PRECISION NOT NULL,
    "specificity" DOUBLE PRECISION NOT NULL,
    "directness" DOUBLE PRECISION NOT NULL,
    "freshness" DOUBLE PRECISION NOT NULL,
    "temporalRelevance" DOUBLE PRECISION NOT NULL,
    "independenceGroup" TEXT NOT NULL,
    "provenance" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceHypothesisRelation" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "hypothesisId" TEXT NOT NULL,
    "relation" "EvidenceRelationType" NOT NULL,
    "reasoning" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "contradictionSeverity" "ContradictionSeverity",

    CONSTRAINT "EvidenceHypothesisRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hypothesis_investigationId_reference_key" ON "Hypothesis"("investigationId", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "Evidence_investigationId_reference_key" ON "Evidence"("investigationId", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceHypothesisRelation_evidenceId_hypothesisId_key" ON "EvidenceHypothesisRelation"("evidenceId", "hypothesisId");

-- AddForeignKey
ALTER TABLE "Hypothesis" ADD CONSTRAINT "Hypothesis_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceHypothesisRelation" ADD CONSTRAINT "EvidenceHypothesisRelation_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceHypothesisRelation" ADD CONSTRAINT "EvidenceHypothesisRelation_hypothesisId_fkey" FOREIGN KEY ("hypothesisId") REFERENCES "Hypothesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
