/** Applique une remise en pourcentage (0-100) a un prix. Retourne un entier (DA). */
export function applyDiscount(price: number, percent: number): number {
  if (!percent || percent <= 0) return price;
  return Math.round(price * (1 - percent / 100));
}
