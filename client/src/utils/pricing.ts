import type { Product } from "../types";

/** Prix apres remise (%). Meme formule que le serveur : entier (DA). */
export function discountedPrice(base: number, percent: number): number {
  if (!percent || percent <= 0) return base;
  return Math.round(base * (1 - percent / 100));
}

export function hasPromo(product: Pick<Product, "discountPercent">): boolean {
  return product.discountPercent > 0;
}
