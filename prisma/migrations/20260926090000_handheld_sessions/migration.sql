-- AlterTable
ALTER TABLE "PosDeviceSession" ADD COLUMN     "membershipId" TEXT;

-- CreateIndex
CREATE INDEX "PosDeviceSession_membershipId_idx" ON "PosDeviceSession"("membershipId");

-- AddForeignKey
ALTER TABLE "PosDeviceSession" ADD CONSTRAINT "PosDeviceSession_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
