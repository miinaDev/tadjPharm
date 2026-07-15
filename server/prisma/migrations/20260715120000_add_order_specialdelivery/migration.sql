-- Livraison speciale : marque une commande dont au moins un produit n'est pas livrable
-- normalement (tarif de livraison fixe ensuite par l'admin).
ALTER TABLE "Order" ADD COLUMN "specialDelivery" BOOLEAN NOT NULL DEFAULT false;
