-- Backfill : deduire une couleur hex a partir du nom pour les couleurs deja saisies
-- (le hexCode existe deja mais n'etait jamais rempli -> pastilles grises).
-- Ne touche que les lignes sans hex ; laisse les autres inchangees.
UPDATE "ProductColor" SET "hexCode" = CASE lower(label)
  WHEN 'rouge' THEN '#ef4444' WHEN 'red' THEN '#ef4444'
  WHEN 'orange' THEN '#f97316'
  WHEN 'jaune' THEN '#eab308' WHEN 'yellow' THEN '#eab308'
  WHEN 'vert' THEN '#22c55e' WHEN 'green' THEN '#22c55e'
  WHEN 'bleu' THEN '#3b82f6' WHEN 'blue' THEN '#3b82f6'
  WHEN 'indigo' THEN '#6366f1'
  WHEN 'violet' THEN '#8b5cf6' WHEN 'purple' THEN '#8b5cf6'
  WHEN 'rose' THEN '#ec4899' WHEN 'pink' THEN '#ec4899'
  WHEN 'noir' THEN '#111827' WHEN 'black' THEN '#111827'
  WHEN 'blanc' THEN '#ffffff' WHEN 'white' THEN '#ffffff'
  WHEN 'gris' THEN '#9ca3af' WHEN 'grey' THEN '#9ca3af' WHEN 'gray' THEN '#9ca3af'
  WHEN 'marron' THEN '#92400e' WHEN 'brun' THEN '#92400e' WHEN 'brown' THEN '#92400e'
  WHEN 'turquoise' THEN '#06b6d4' WHEN 'cyan' THEN '#06b6d4'
  WHEN 'beige' THEN '#e7d8b5'
  ELSE "hexCode" END
WHERE "hexCode" IS NULL;
