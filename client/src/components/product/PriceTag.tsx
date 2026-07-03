export function PriceTag({ amount, className = "" }: { amount: number; className?: string }) {
  return <span className={className}>{amount.toLocaleString("fr-FR")} DA</span>;
}
