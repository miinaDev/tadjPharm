import { PriceTag } from "../product/PriceTag";

interface OrderSummaryProps {
  subtotal: number;
  itemCount: number;
  deliveryFee: number | null;
}

export function OrderSummary({ subtotal, itemCount, deliveryFee }: OrderSummaryProps) {
  const total = subtotal + (deliveryFee ?? 0);

  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-2xl bg-brand-500 text-white">
      <div className="px-4 py-4">
        <p className="text-[11px] text-white/70">Sous-total ({itemCount})</p>
        <PriceTag amount={subtotal} className="mt-1 block text-sm font-semibold" />
      </div>
      <div className="border-l border-white/20 px-4 py-4">
        <p className="text-[11px] text-white/70">Livraison</p>
        {deliveryFee === null ? (
          <span className="mt-1 block text-sm font-semibold">—</span>
        ) : (
          <PriceTag amount={deliveryFee} className="mt-1 block text-sm font-semibold" />
        )}
      </div>
      <div className="border-l border-white/20 px-4 py-4">
        <p className="text-[11px] text-white/70">Total</p>
        <PriceTag amount={total} className="mt-1 block text-sm font-semibold" />
      </div>
    </div>
  );
}
