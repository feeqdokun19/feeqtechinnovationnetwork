-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "providerAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "providerAcceptedAt" TIMESTAMP(3);
