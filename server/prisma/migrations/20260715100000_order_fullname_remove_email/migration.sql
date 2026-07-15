-- Fusion prenom + nom en un seul champ "nom complet" et suppression de l'email sur la commande.
-- 1. Nouveau champ nom complet
ALTER TABLE "Order" ADD COLUMN "fullName" TEXT;
-- 2. Backfill depuis prenom + nom des commandes existantes
UPDATE "Order" SET "fullName" = TRIM(COALESCE("firstName", '') || ' ' || COALESCE("lastName", ''));
-- 3. Rendre obligatoire
ALTER TABLE "Order" ALTER COLUMN "fullName" SET NOT NULL;
-- 4. Supprimer les anciennes colonnes
ALTER TABLE "Order" DROP COLUMN "firstName", DROP COLUMN "lastName", DROP COLUMN "email";
