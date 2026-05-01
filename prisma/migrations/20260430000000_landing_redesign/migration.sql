-- AlterTable
ALTER TABLE "User" ADD COLUMN "mergedAnonymousKey" TEXT;
ALTER TABLE "User" ADD COLUMN "signupIpHash" TEXT;

-- CreateTable
CREATE TABLE "IpFreeUsage" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpFreeUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IpFreeUsage_ipHash_key" ON "IpFreeUsage"("ipHash");
