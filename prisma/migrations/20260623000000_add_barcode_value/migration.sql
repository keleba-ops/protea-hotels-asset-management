-- AlterTable
ALTER TABLE "Asset" ADD COLUMN "barcodeValue" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Asset_barcodeValue_key" ON "Asset"("barcodeValue");
