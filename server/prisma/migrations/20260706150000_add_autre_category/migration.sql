-- Categorie de repli "Autre" : disponible dans le selecteur admin et utilisee
-- a l'import Excel quand la colonne categorie est vide ou vaut "Autre".
-- Idempotent : ne fait rien si une categorie du meme nom/slug existe deja.
INSERT INTO "Category" ("id", "name", "slug")
VALUES ('cat_autre_default', 'Autre', 'autre')
ON CONFLICT DO NOTHING;
