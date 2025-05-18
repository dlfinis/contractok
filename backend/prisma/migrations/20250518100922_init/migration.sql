-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "world_id" TEXT NOT NULL,
    "name" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldIDLink" (
    "id" SERIAL NOT NULL,
    "nullifier_hash" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "signal" TEXT,
    "verification_level" TEXT,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorldIDLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "codigoVinculacion" CHAR(4) NOT NULL,
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "plazoEntrega" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL,
    "creadorWorldId" TEXT NOT NULL,
    "contraparteWorldId" TEXT,
    "aprobadoCreador" BOOLEAN NOT NULL DEFAULT false,
    "aprobadoContraparte" BOOLEAN NOT NULL DEFAULT false,
    "deadlineAprobacion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_world_id_key" ON "User"("world_id");

-- CreateIndex
CREATE UNIQUE INDEX "WorldIDLink_nullifier_hash_key" ON "WorldIDLink"("nullifier_hash");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_codigoVinculacion_key" ON "Contract"("codigoVinculacion");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_creadorWorldId_fkey" FOREIGN KEY ("creadorWorldId") REFERENCES "User"("world_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_contraparteWorldId_fkey" FOREIGN KEY ("contraparteWorldId") REFERENCES "User"("world_id") ON DELETE SET NULL ON UPDATE CASCADE;
