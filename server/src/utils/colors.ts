// Miroir cote serveur de client/src/utils/colors.ts : deduit un hex a partir
// d'un nom de couleur (FR + EN). Utilise a l'import Excel pour remplir hexCode.
export const DEFAULT_SWATCH = "#cbd5e1";

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

/** hex deduit du nom, sinon repli gris. */
export function guessColorHex(label: string): string {
  const normalized = normalize(label);
  if (!normalized) return DEFAULT_SWATCH;
  if (NAMED_COLORS[normalized]) return NAMED_COLORS[normalized];
  for (const word of normalized.split(/[\s/-]+/)) {
    if (NAMED_COLORS[word]) return NAMED_COLORS[word];
  }
  return DEFAULT_SWATCH;
}
