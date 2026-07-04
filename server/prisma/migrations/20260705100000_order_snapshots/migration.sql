-- Commandes en "plein texte" : figer nom produit / libelle variante / nom wilaya
-- pour que supprimer ou modifier un produit / une wilaya n'altere pas l'historique.

-- 1) Colonnes snapshot (default '' remplit les lignes existantes)
ALTER TABLE "OrderItem" ADD COLUMN "productNameSnapshot" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OrderItem" ADD COLUMN "variantLabelSnapshot" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN "wilayaNameSnapshot" TEXT NOT NULL DEFAULT '';

-- 2) Backfill des commandes existantes depuis les relations vivantes
UPDATE "Order" o
SET "wilayaNameSnapshot" = w.name
FROM "Wilaya" w
WHERE o."wilayaId" = w.id;

UPDATE "OrderItem" oi
SET
  "productNameSnapshot" = p.name,
  "variantLabelSnapshot" = COALESCE(NULLIF(TRIM(CONCAT_WS(' / ', c.label, s.label, vol.label)), ''), 'Standard')
FROM "ProductVariant" v
JOIN "Product" p ON p.id = v."productId"
LEFT JOIN "ProductColor" c ON c.id = v."colorId"
LEFT JOIN "ProductSize" s ON s.id = v."sizeId"
LEFT JOIN "ProductVolume" vol ON vol.id = v."volumeId"
WHERE oi."variantId" = v.id;

-- 3) Relations optionnelles + ON DELETE SET NULL (suppression libre, commande preservee)
ALTER TABLE "Order" ALTER COLUMN "wilayaId" DROP NOT NULL;
ALTER TABLE "Order" DROP CONSTRAINT "Order_wilayaId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_wilayaId_fkey"
  FOREIGN KEY ("wilayaId") REFERENCES "Wilaya"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ALTER COLUMN "variantId" DROP NOT NULL;
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_variantId_fkey";
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey"
  FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
