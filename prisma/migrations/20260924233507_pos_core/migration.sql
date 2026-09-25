-- CreateEnum
CREATE TYPE "PosOrderStatus" AS ENUM ('OPEN', 'SENT', 'PARTIALLY_PAID', 'PAID', 'VOID');

-- CreateEnum
CREATE TYPE "PosLineStatus" AS ENUM ('NEW', 'SENT', 'PREPARING', 'READY', 'SERVED', 'VOID');

-- CreateEnum
CREATE TYPE "PosPaymentMethod" AS ENUM ('CASH', 'CARD', 'MEAL_CARD', 'ONLINE', 'ON_ACCOUNT');

-- CreateEnum
CREATE TYPE "PosShiftStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "PosCashMovementType" AS ENUM ('PAID_IN', 'PAID_OUT');

-- CreateEnum
CREATE TYPE "PosPrintJobKind" AS ENUM ('RECEIPT', 'KITCHEN', 'REPORT');

-- CreateEnum
CREATE TYPE "PosPrintJobStatus" AS ENUM ('QUEUED', 'PRINTING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "FiscalReceiptStatus" AS ENUM ('QUEUED', 'SENT', 'CONFIRMED', 'FAILED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'CASHIER';
ALTER TYPE "Role" ADD VALUE 'WAITER';

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "posOrderId" TEXT;

-- CreateTable
CREATE TABLE "PosArea" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosTable" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 4,
    "posX" INTEGER NOT NULL DEFAULT 0,
    "posY" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosTaxGroup" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ratePct" DOUBLE PRECISION NOT NULL,
    "okcDepartment" INTEGER,

    CONSTRAINT "PosTaxGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosCategory" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "station" TEXT NOT NULL DEFAULT 'KITCHEN',
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PosCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosProduct" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "menuItemExtId" TEXT,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "priceMinor" INTEGER NOT NULL,
    "taxGroupId" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosModifierGroup" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minSelect" INTEGER NOT NULL DEFAULT 0,
    "maxSelect" INTEGER NOT NULL DEFAULT 1,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PosModifierGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosModifier" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceMinor" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PosModifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosProductModifierGroup" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PosProductModifierGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosOrder" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "clientOrderId" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "businessDay" DATE NOT NULL,
    "tableId" TEXT,
    "shiftId" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'DINE_IN',
    "status" "PosOrderStatus" NOT NULL DEFAULT 'OPEN',
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "subtotalMinor" INTEGER NOT NULL DEFAULT 0,
    "discountMinor" INTEGER NOT NULL DEFAULT 0,
    "serviceMinor" INTEGER NOT NULL DEFAULT 0,
    "taxMinor" INTEGER NOT NULL DEFAULT 0,
    "totalMinor" INTEGER NOT NULL DEFAULT 0,
    "paidMinor" INTEGER NOT NULL DEFAULT 0,
    "openedByMembershipId" TEXT NOT NULL,
    "closedByMembershipId" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosOrderLine" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "menuItemExtId" TEXT,
    "name" TEXT NOT NULL,
    "station" TEXT NOT NULL DEFAULT 'KITCHEN',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceMinor" INTEGER NOT NULL,
    "modifiersMinor" INTEGER NOT NULL DEFAULT 0,
    "discountMinor" INTEGER NOT NULL DEFAULT 0,
    "lineTotalMinor" INTEGER NOT NULL DEFAULT 0,
    "taxRatePct" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "status" "PosLineStatus" NOT NULL DEFAULT 'NEW',
    "note" TEXT,
    "isComped" BOOLEAN NOT NULL DEFAULT false,
    "voidReason" TEXT,
    "voidedByMembershipId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "readyAt" TIMESTAMP(3),
    "servedAt" TIMESTAMP(3),

    CONSTRAINT "PosOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosOrderLineModifier" (
    "id" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "modifierId" TEXT,
    "name" TEXT NOT NULL,
    "priceMinor" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PosOrderLineModifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosPayment" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "shiftId" TEXT,
    "method" "PosPaymentMethod" NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "tenderedMinor" INTEGER,
    "changeMinor" INTEGER NOT NULL DEFAULT 0,
    "reference" TEXT,
    "receivedByMembershipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalReceipt" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "deviceId" TEXT,
    "provider" TEXT NOT NULL,
    "status" "FiscalReceiptStatus" NOT NULL DEFAULT 'QUEUED',
    "okcSerial" TEXT,
    "zNo" INTEGER,
    "fiscalNo" TEXT,
    "receiptNo" TEXT,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "FiscalReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosShift" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "deviceId" TEXT,
    "status" "PosShiftStatus" NOT NULL DEFAULT 'OPEN',
    "openingCashMinor" INTEGER NOT NULL DEFAULT 0,
    "expectedCashMinor" INTEGER,
    "countedCashMinor" INTEGER,
    "differenceMinor" INTEGER,
    "note" TEXT,
    "openedByMembershipId" TEXT NOT NULL,
    "closedByMembershipId" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "PosShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosCashMovement" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "type" "PosCashMovementType" NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdByMembershipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosCashMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosDevice" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'TERMINAL',
    "tokenHash" TEXT NOT NULL,
    "credentialVersion" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosDeviceSession" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "credentialVersion" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosDeviceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosStaffPin" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosStaffPin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosAuditLog" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "membershipId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosPrintJob" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "deviceId" TEXT,
    "kind" "PosPrintJobKind" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "PosPrintJobStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "printedAt" TIMESTAMP(3),

    CONSTRAINT "PosPrintJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PosArea_restaurantId_idx" ON "PosArea"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "PosArea_restaurantId_name_key" ON "PosArea"("restaurantId", "name");

-- CreateIndex
CREATE INDEX "PosTable_restaurantId_idx" ON "PosTable"("restaurantId");

-- CreateIndex
CREATE INDEX "PosTable_areaId_idx" ON "PosTable"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "PosTable_restaurantId_name_key" ON "PosTable"("restaurantId", "name");

-- CreateIndex
CREATE INDEX "PosTaxGroup_restaurantId_idx" ON "PosTaxGroup"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "PosTaxGroup_restaurantId_name_key" ON "PosTaxGroup"("restaurantId", "name");

-- CreateIndex
CREATE INDEX "PosCategory_restaurantId_idx" ON "PosCategory"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "PosCategory_restaurantId_name_key" ON "PosCategory"("restaurantId", "name");

-- CreateIndex
CREATE INDEX "PosProduct_restaurantId_idx" ON "PosProduct"("restaurantId");

-- CreateIndex
CREATE INDEX "PosProduct_categoryId_idx" ON "PosProduct"("categoryId");

-- CreateIndex
CREATE INDEX "PosProduct_restaurantId_menuItemExtId_idx" ON "PosProduct"("restaurantId", "menuItemExtId");

-- CreateIndex
CREATE UNIQUE INDEX "PosProduct_restaurantId_sku_key" ON "PosProduct"("restaurantId", "sku");

-- CreateIndex
CREATE INDEX "PosModifierGroup_restaurantId_idx" ON "PosModifierGroup"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "PosModifierGroup_restaurantId_name_key" ON "PosModifierGroup"("restaurantId", "name");

-- CreateIndex
CREATE INDEX "PosModifier_groupId_idx" ON "PosModifier"("groupId");

-- CreateIndex
CREATE INDEX "PosProductModifierGroup_groupId_idx" ON "PosProductModifierGroup"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "PosProductModifierGroup_productId_groupId_key" ON "PosProductModifierGroup"("productId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "PosOrder_clientOrderId_key" ON "PosOrder"("clientOrderId");

-- CreateIndex
CREATE INDEX "PosOrder_restaurantId_status_idx" ON "PosOrder"("restaurantId", "status");

-- CreateIndex
CREATE INDEX "PosOrder_restaurantId_openedAt_idx" ON "PosOrder"("restaurantId", "openedAt");

-- CreateIndex
CREATE INDEX "PosOrder_tableId_idx" ON "PosOrder"("tableId");

-- CreateIndex
CREATE INDEX "PosOrder_shiftId_idx" ON "PosOrder"("shiftId");

-- CreateIndex
CREATE UNIQUE INDEX "PosOrder_restaurantId_businessDay_code_key" ON "PosOrder"("restaurantId", "businessDay", "code");

-- CreateIndex
CREATE INDEX "PosOrderLine_orderId_idx" ON "PosOrderLine"("orderId");

-- CreateIndex
CREATE INDEX "PosOrderLine_status_station_idx" ON "PosOrderLine"("status", "station");

-- CreateIndex
CREATE INDEX "PosOrderLineModifier_lineId_idx" ON "PosOrderLineModifier"("lineId");

-- CreateIndex
CREATE INDEX "PosPayment_restaurantId_createdAt_idx" ON "PosPayment"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "PosPayment_orderId_idx" ON "PosPayment"("orderId");

-- CreateIndex
CREATE INDEX "PosPayment_shiftId_idx" ON "PosPayment"("shiftId");

-- CreateIndex
CREATE INDEX "FiscalReceipt_restaurantId_status_idx" ON "FiscalReceipt"("restaurantId", "status");

-- CreateIndex
CREATE INDEX "FiscalReceipt_orderId_idx" ON "FiscalReceipt"("orderId");

-- CreateIndex
CREATE INDEX "PosShift_restaurantId_status_idx" ON "PosShift"("restaurantId", "status");

-- CreateIndex
CREATE INDEX "PosShift_restaurantId_openedAt_idx" ON "PosShift"("restaurantId", "openedAt");

-- CreateIndex
CREATE INDEX "PosCashMovement_shiftId_idx" ON "PosCashMovement"("shiftId");

-- CreateIndex
CREATE UNIQUE INDEX "PosDevice_tokenHash_key" ON "PosDevice"("tokenHash");

-- CreateIndex
CREATE INDEX "PosDevice_restaurantId_idx" ON "PosDevice"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "PosDevice_restaurantId_name_key" ON "PosDevice"("restaurantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PosDeviceSession_tokenHash_key" ON "PosDeviceSession"("tokenHash");

-- CreateIndex
CREATE INDEX "PosDeviceSession_deviceId_idx" ON "PosDeviceSession"("deviceId");

-- CreateIndex
CREATE INDEX "PosDeviceSession_expiresAt_idx" ON "PosDeviceSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PosStaffPin_membershipId_key" ON "PosStaffPin"("membershipId");

-- CreateIndex
CREATE INDEX "PosAuditLog_restaurantId_createdAt_idx" ON "PosAuditLog"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "PosAuditLog_entity_entityId_idx" ON "PosAuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "PosPrintJob_restaurantId_status_idx" ON "PosPrintJob"("restaurantId", "status");

-- CreateIndex
CREATE INDEX "PosPrintJob_deviceId_status_idx" ON "PosPrintJob"("deviceId", "status");

-- CreateIndex
CREATE INDEX "Sale_restaurantId_occurredAt_idx" ON "Sale"("restaurantId", "occurredAt");

-- CreateIndex
CREATE INDEX "Sale_posOrderId_idx" ON "Sale"("posOrderId");

-- AddForeignKey
ALTER TABLE "PosArea" ADD CONSTRAINT "PosArea_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosTable" ADD CONSTRAINT "PosTable_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosTable" ADD CONSTRAINT "PosTable_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "PosArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosTaxGroup" ADD CONSTRAINT "PosTaxGroup_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosCategory" ADD CONSTRAINT "PosCategory_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosProduct" ADD CONSTRAINT "PosProduct_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosProduct" ADD CONSTRAINT "PosProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PosCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosProduct" ADD CONSTRAINT "PosProduct_taxGroupId_fkey" FOREIGN KEY ("taxGroupId") REFERENCES "PosTaxGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosModifierGroup" ADD CONSTRAINT "PosModifierGroup_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosModifier" ADD CONSTRAINT "PosModifier_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PosModifierGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosProductModifierGroup" ADD CONSTRAINT "PosProductModifierGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "PosProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosProductModifierGroup" ADD CONSTRAINT "PosProductModifierGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PosModifierGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrder" ADD CONSTRAINT "PosOrder_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrder" ADD CONSTRAINT "PosOrder_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "PosTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrder" ADD CONSTRAINT "PosOrder_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "PosShift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrder" ADD CONSTRAINT "PosOrder_openedByMembershipId_fkey" FOREIGN KEY ("openedByMembershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrder" ADD CONSTRAINT "PosOrder_closedByMembershipId_fkey" FOREIGN KEY ("closedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrderLine" ADD CONSTRAINT "PosOrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PosOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrderLine" ADD CONSTRAINT "PosOrderLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "PosProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrderLine" ADD CONSTRAINT "PosOrderLine_voidedByMembershipId_fkey" FOREIGN KEY ("voidedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrderLineModifier" ADD CONSTRAINT "PosOrderLineModifier_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "PosOrderLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrderLineModifier" ADD CONSTRAINT "PosOrderLineModifier_modifierId_fkey" FOREIGN KEY ("modifierId") REFERENCES "PosModifier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosPayment" ADD CONSTRAINT "PosPayment_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosPayment" ADD CONSTRAINT "PosPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PosOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosPayment" ADD CONSTRAINT "PosPayment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "PosShift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosPayment" ADD CONSTRAINT "PosPayment_receivedByMembershipId_fkey" FOREIGN KEY ("receivedByMembershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalReceipt" ADD CONSTRAINT "FiscalReceipt_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalReceipt" ADD CONSTRAINT "FiscalReceipt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PosOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalReceipt" ADD CONSTRAINT "FiscalReceipt_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "PosDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosShift" ADD CONSTRAINT "PosShift_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosShift" ADD CONSTRAINT "PosShift_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "PosDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosShift" ADD CONSTRAINT "PosShift_openedByMembershipId_fkey" FOREIGN KEY ("openedByMembershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosShift" ADD CONSTRAINT "PosShift_closedByMembershipId_fkey" FOREIGN KEY ("closedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosCashMovement" ADD CONSTRAINT "PosCashMovement_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "PosShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosCashMovement" ADD CONSTRAINT "PosCashMovement_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosDevice" ADD CONSTRAINT "PosDevice_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosDeviceSession" ADD CONSTRAINT "PosDeviceSession_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "PosDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosStaffPin" ADD CONSTRAINT "PosStaffPin_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosAuditLog" ADD CONSTRAINT "PosAuditLog_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosAuditLog" ADD CONSTRAINT "PosAuditLog_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosPrintJob" ADD CONSTRAINT "PosPrintJob_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosPrintJob" ADD CONSTRAINT "PosPrintJob_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "PosDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
