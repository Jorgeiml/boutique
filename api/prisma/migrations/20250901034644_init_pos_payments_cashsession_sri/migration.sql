/*
  Warnings:

  - A unique constraint covering the columns `[companyId,document]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,code]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,sku]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,barcode]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `reason` on the `StockMovement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `sku` on table `Variant` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."StockReason" AS ENUM ('SALE', 'PURCHASE', 'ADJUST', 'RETURN', 'TRANSFER');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SriEnvironment" AS ENUM ('TEST', 'PROD');

-- DropIndex
DROP INDEX "public"."Client_document_key";

-- DropIndex
DROP INDEX "public"."Product_code_key";

-- DropIndex
DROP INDEX "public"."Variant_companyId_sku_idx";

-- DropIndex
DROP INDEX "public"."Variant_sku_key";

-- AlterTable
ALTER TABLE "public"."Invoice" ADD COLUMN     "accessKey" TEXT,
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "environment" "public"."SriEnvironment",
ADD COLUMN     "estab" VARCHAR(3),
ADD COLUMN     "point" VARCHAR(3),
ADD COLUMN     "sequential" INTEGER;

-- AlterTable
ALTER TABLE "public"."StockMovement" DROP COLUMN "reason",
ADD COLUMN     "reason" "public"."StockReason" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Variant" ADD COLUMN     "barcode" TEXT,
ALTER COLUMN "sku" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."OrderPayment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "reference" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CashSession" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "openingAmount" DECIMAL(12,2) NOT NULL,
    "closingAmount" DECIMAL(12,2),
    "notes" TEXT,

    CONSTRAINT "CashSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderPayment_orderId_idx" ON "public"."OrderPayment"("orderId");

-- CreateIndex
CREATE INDEX "OrderPayment_companyId_createdAt_idx" ON "public"."OrderPayment"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "CashSession_companyId_openedAt_idx" ON "public"."CashSession"("companyId", "openedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Client_companyId_document_key" ON "public"."Client"("companyId", "document");

-- CreateIndex
CREATE UNIQUE INDEX "Product_companyId_code_key" ON "public"."Product"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_companyId_sku_key" ON "public"."Variant"("companyId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_companyId_barcode_key" ON "public"."Variant"("companyId", "barcode");

-- AddForeignKey
ALTER TABLE "public"."OrderPayment" ADD CONSTRAINT "OrderPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderPayment" ADD CONSTRAINT "OrderPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderPayment" ADD CONSTRAINT "OrderPayment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."CashSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CashSession" ADD CONSTRAINT "CashSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CashSession" ADD CONSTRAINT "CashSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
