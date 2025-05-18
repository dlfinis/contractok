/*
  Warnings:

  - A unique constraint covering the columns `[codigoVinculacion]` on the table `Contract` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigoVinculacion` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "codigoVinculacion" CHAR(4) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Contract_codigoVinculacion_key" ON "Contract"("codigoVinculacion");
