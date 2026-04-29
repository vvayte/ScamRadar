-- AlterTable
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionStatus" TEXT;

-- CreateTable
CREATE TABLE "AnonymousUsage" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "count" INTEGER NOT NULL DEFAULT 0,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnonymousUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeCheckoutSession" (
    "id" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "userId" TEXT,
    "anonymousKey" TEXT,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeCheckoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatReport" (
    "id" TEXT NOT NULL,
    "indicatorType" TEXT NOT NULL,
    "indicatorValue" TEXT NOT NULL,
    "platform" TEXT,
    "notes" TEXT,
    "reporterEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreatReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousUsage_key_key" ON "AnonymousUsage"("key");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSignup_email_key" ON "NewsletterSignup"("email");
