-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "providerDeclineReason" TEXT,
ADD COLUMN     "providerDeclinedAt" TIMESTAMP(3);
