/*
  Warnings:

  - You are about to drop the column `contraparteId` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `creadorId` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hash_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creadorHashId` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hash_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_contraparteId_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_creadorId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "contraparteId",
DROP COLUMN "creadorId",
ADD COLUMN     "contraparteHashId" TEXT,
ADD COLUMN     "creadorHashId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
ADD COLUMN     "hash_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorldIDLink" ALTER COLUMN "verification_level" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_hash_id_key" ON "User"("hash_id");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_creadorHashId_fkey" FOREIGN KEY ("creadorHashId") REFERENCES "User"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_contraparteHashId_fkey" FOREIGN KEY ("contraparteHashId") REFERENCES "User"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;
