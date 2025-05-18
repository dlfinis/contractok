-- CreateTable
CREATE TABLE "Contract" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "plazoEntrega" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL,
    "creadorId" INTEGER NOT NULL,
    "contraparteId" INTEGER,
    "aprobadoCreador" BOOLEAN NOT NULL DEFAULT false,
    "aprobadoContraparte" BOOLEAN NOT NULL DEFAULT false,
    "deadlineAprobacion" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_contraparteId_fkey" FOREIGN KEY ("contraparteId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
