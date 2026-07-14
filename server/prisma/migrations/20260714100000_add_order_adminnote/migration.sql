-- Note interne admin par commande (non visible du client)
ALTER TABLE "Order" ADD COLUMN "adminNote" TEXT NOT NULL DEFAULT '';
