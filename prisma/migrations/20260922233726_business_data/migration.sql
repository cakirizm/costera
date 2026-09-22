-- CreateEnum
CREATE TYPE "DataSourceKind" AS ENUM ('DEMO', 'IMPORT', 'POS_API');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "targetFoodCostPct" DOUBLE PRECISION NOT NULL DEFAULT 25;

-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "kind" "DataSourceKind" NOT NULL,
    "provider" TEXT NOT NULL,
    "periodFrom" TIMESTAMP(3) NOT NULL,
    "periodTo" TIMESTAMP(3) NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "extId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "extId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sellingPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeLine" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "ingredientExtId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RecipeLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "menuItemExtId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "channel" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "netSales" DOUBLE PRECISION,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryRow" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "ingredientExtId" TEXT NOT NULL,
    "openingQty" DOUBLE PRECISION NOT NULL,
    "purchasesQty" DOUBLE PRECISION NOT NULL,
    "transferInQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transferOutQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "closingQty" DOUBLE PRECISION NOT NULL,
    "knownWasteQty" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "InventoryRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_restaurantId_key" ON "DataSource"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_restaurantId_extId_key" ON "Ingredient"("restaurantId", "extId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_restaurantId_extId_key" ON "MenuItem"("restaurantId", "extId");

-- CreateIndex
CREATE INDEX "Sale_restaurantId_idx" ON "Sale"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryRow_restaurantId_ingredientExtId_key" ON "InventoryRow"("restaurantId", "ingredientExtId");

-- AddForeignKey
ALTER TABLE "DataSource" ADD CONSTRAINT "DataSource_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeLine" ADD CONSTRAINT "RecipeLine_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRow" ADD CONSTRAINT "InventoryRow_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
