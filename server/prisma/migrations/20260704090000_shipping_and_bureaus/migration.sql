-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('HOME', 'OFFICE');

-- AlterTable Wilaya : deliveryPrice -> homePrice + officePrice (avec reprise des valeurs existantes)
ALTER TABLE "Wilaya" ADD COLUMN "homePrice" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "Wilaya" ADD COLUMN "officePrice" DECIMAL(10,2) NOT NULL DEFAULT 0;
UPDATE "Wilaya" SET "homePrice" = "deliveryPrice", "officePrice" = "deliveryPrice";
ALTER TABLE "Wilaya" DROP COLUMN "deliveryPrice";

-- CreateTable DeliveryBureau
CREATE TABLE "DeliveryBureau" (
    "id" TEXT NOT NULL,
    "wilayaId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryBureau_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryBureau_wilayaId_idx" ON "DeliveryBureau"("wilayaId");

-- AddForeignKey
ALTER TABLE "DeliveryBureau" ADD CONSTRAINT "DeliveryBureau_wilayaId_fkey" FOREIGN KEY ("wilayaId") REFERENCES "Wilaya"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable Order : mode d'expedition, adresse, bureau
ALTER TABLE "Order" ADD COLUMN "shippingMethod" "ShippingMethod" NOT NULL DEFAULT 'HOME';
ALTER TABLE "Order" ADD COLUMN "address" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN "bureauId" TEXT;
ALTER TABLE "Order" ADD COLUMN "bureauNameSnapshot" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_bureauId_fkey" FOREIGN KEY ("bureauId") REFERENCES "DeliveryBureau"("id") ON DELETE SET NULL ON UPDATE CASCADE;
