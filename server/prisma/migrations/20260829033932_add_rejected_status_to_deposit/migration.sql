-- AlterEnum
ALTER TYPE "DepositStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "deposits" ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT;
