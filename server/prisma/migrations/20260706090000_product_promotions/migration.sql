-- Promotions produit : taux de reduction (%) + etiquette/ruban optionnelle.
-- Additive (defaut / nullable) : aucun backfill necessaire.
ALTER TABLE "Product" ADD COLUMN "discountPercent" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "ribbonLabel" TEXT;
