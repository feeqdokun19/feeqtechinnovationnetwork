-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customerApprovedAt" TIMESTAMP(3),
ADD COLUMN     "providerApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "providerApprovedAt" TIMESTAMP(3);
