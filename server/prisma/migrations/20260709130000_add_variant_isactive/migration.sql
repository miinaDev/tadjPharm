-- Activation/desactivation par combinaison (variante). Toutes actives par defaut.
-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
