/*
  Warnings:

  - You are about to drop the column `waAccountId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the `WhatsAppAccount` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `twilioAccountId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_waAccountId_fkey";

-- DropForeignKey
ALTER TABLE "WhatsAppAccount" DROP CONSTRAINT "WhatsAppAccount_businessId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "waAccountId",
ADD COLUMN     "twilioAccountId" TEXT NOT NULL,
ALTER COLUMN "deletedAt" SET DEFAULT NULL;

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "deletedAt" SET DEFAULT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "deletedAt" SET DEFAULT NULL;

-- DropTable
DROP TABLE "WhatsAppAccount";

-- CreateTable
CREATE TABLE "TwilioAccount" (
    "id" TEXT NOT NULL,
    "accountSid" TEXT NOT NULL,
    "authToken" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "messagingServiceSid" TEXT,
    "businessName" TEXT,
    "webhookVerifyToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwilioAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwilioAccount_accountSid_key" ON "TwilioAccount"("accountSid");

-- AddForeignKey
ALTER TABLE "TwilioAccount" ADD CONSTRAINT "TwilioAccount_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_twilioAccountId_fkey" FOREIGN KEY ("twilioAccountId") REFERENCES "TwilioAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
