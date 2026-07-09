-- Suppression de la gestion de stock, remplacee par une disponibilite au niveau produit.
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "lowStockThreshold",
DROP COLUMN "trackStock",
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "stockQuantity";
