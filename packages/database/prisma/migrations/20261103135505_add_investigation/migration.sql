-- CreateEnum
CREATE TYPE "InvestigationStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'DEGRADED', 'FAILED');

-- CreateEnum
CREATE TYPE "IntegrityLevel" AS ENUM ('HIGH', 'MODERATE', 'DEGRADED', 'LOW');

-- CreateTable
CREATE TABLE "Investigation" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "status" "InvestigationStatus" NOT NULL DEFAULT 'PENDING',
    "integrity" "IntegrityLevel" NOT NULL DEFAULT 'HIGH',
    "evidenceCoverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leadingHypothesisId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Investigation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Investigation_incidentId_key" ON "Investigation"("incidentId");

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
