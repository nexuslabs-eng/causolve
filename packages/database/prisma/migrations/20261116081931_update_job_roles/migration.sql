/*
  Warnings:

  - The values [DEVOPS_PLATFORM_ENGINEER,INCIDENT_COMMANDER] on the enum `JobRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JobRole_new" AS ENUM ('FRONTEND_ENGINEER', 'BACKEND_ENGINEER', 'FULL_STACK_ENGINEER', 'SOFTWARE_ENGINEER', 'SITE_RELIABILITY_ENGINEER', 'DEVOPS_ENGINEER', 'PLATFORM_ENGINEER', 'CLOUD_INFRASTRUCTURE_ENGINEER', 'SECURITY_ENGINEER', 'DATA_ENGINEER', 'QA_TEST_ENGINEER', 'STAFF_ENGINEER', 'PRINCIPAL_ENGINEER', 'ENGINEERING_MANAGER', 'SOLUTIONS_ARCHITECT', 'OTHER');
ALTER TABLE "User" ALTER COLUMN "jobRole" TYPE "JobRole_new" USING ("jobRole"::text::"JobRole_new");
ALTER TABLE "Invitation" ALTER COLUMN "inviteeJobRole" TYPE "JobRole_new" USING ("inviteeJobRole"::text::"JobRole_new");
ALTER TYPE "JobRole" RENAME TO "JobRole_old";
ALTER TYPE "JobRole_new" RENAME TO "JobRole";
DROP TYPE "public"."JobRole_old";
COMMIT;
