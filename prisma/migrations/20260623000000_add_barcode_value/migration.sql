-- AlterTable
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "barcodeValue" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Asset_barcodeValue_key" ON "Asset"("barcodeValue");
