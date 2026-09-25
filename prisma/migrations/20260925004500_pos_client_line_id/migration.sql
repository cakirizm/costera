-- AlterTable
ALTER TABLE "PosOrderLine" ADD COLUMN     "clientLineId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PosOrderLine_clientLineId_key" ON "PosOrderLine"("clientLineId");
