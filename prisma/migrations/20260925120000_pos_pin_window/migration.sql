-- CreateTable
CREATE TABLE "PosPinWindow" (
    "id" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosPinWindow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PosPinWindow_expiresAt_idx" ON "PosPinWindow"("expiresAt");
