-- Livrabilite du produit. true = livraison normale ; false = livraison speciale
-- (pas de bouton acheter, le client contacte la boutique pour un tarif). Tous livrables par defaut.
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isDeliverable" BOOLEAN NOT NULL DEFAULT true;
