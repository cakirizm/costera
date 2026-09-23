CREATE TABLE "MobileSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "credentialVersion" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MobileSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MobileSession_tokenHash_key" ON "MobileSession"("tokenHash");
CREATE INDEX "MobileSession_userId_idx" ON "MobileSession"("userId");
CREATE INDEX "MobileSession_expiresAt_idx" ON "MobileSession"("expiresAt");
ALTER TABLE "MobileSession" ADD CONSTRAINT "MobileSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "MobileLoginWindow" (
  "id" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 1,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MobileLoginWindow_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MobileLoginWindow_expiresAt_idx" ON "MobileLoginWindow"("expiresAt");
