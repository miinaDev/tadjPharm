/** Repli quand le nom ne correspond a aucune couleur connue. */
export const DEFAULT_SWATCH = "#cbd5e1";

// Mots FR + EN -> hex (les couleurs saisies melangent souvent les deux).
const NAMED_COLORS: Record<string, string> = {
  rouge: "#ef4444",
  red: "#ef4444",
  orange: "#f97316",
  jaune: "#eab308",
  yellow: "#eab308",
  vert: "#22c55e",
  green: "#22c55e",
  bleu: "#3b82f6",
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  purple: "#8b5cf6",
  rose: "#ec4899",
  pink: "#ec4899",
  noir: "#111827",
  black: "#111827",
  blanc: "#ffffff",
  white: "#ffffff",
  gris: "#9ca3af",
  grey: "#9ca3af",
  gray: "#9ca3af",
  marron: "#92400e",
  brun: "#92400e",
  brown: "#92400e",
  turquoise: "#06b6d4",
  cyan: "#06b6d4",
  beige: "#e7d8b5",
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents (diacritiques combinants)
    .trim();
}

/** Deduit une couleur hex a partir d'un nom, sinon null. */
export function colorFromName(label: string): string | null {
  const normalized = normalize(label);
  if (!normalized) return null;
  if (NAMED_COLORS[normalized]) return NAMED_COLORS[normalized];
  // Sinon, cherche un mot connu dans le libelle (ex. "rouge fonce").
  for (const word of normalized.split(/[\s/-]+/)) {
    if (NAMED_COLORS[word]) return NAMED_COLORS[word];
  }
  return null;
}

/** Couleur a stocker pour un nouveau nom : detectee ou repli gris. */
export function guessColor(label: string): string {
  return colorFromName(label) ?? DEFAULT_SWATCH;
}
