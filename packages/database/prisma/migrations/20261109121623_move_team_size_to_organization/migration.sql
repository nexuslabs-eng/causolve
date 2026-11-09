/*
  Warnings:

  - You are about to drop the column `teamSize` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "teamSize" "TeamSize";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "teamSize";
