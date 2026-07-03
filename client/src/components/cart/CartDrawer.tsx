import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { QuantityStepper } from "../order/QuantityStepper";
import { PriceTag } from "../product/PriceTag";
import { CheckoutModal } from "../order/CheckoutModal";
import { EmptyState } from "../common/EmptyState";
import { resolveMediaUrl } from "../../api/client";

export function CartDrawer() {
  const cart = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!cart.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm" onClick={cart.closeCart}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-canvas shadow-2xl sm:rounded-l-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <button
            type="button"
            onClick={cart.closeCart}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:text-slate-900"
            aria-label="Fermer"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base font-semibold text-slate-900">Mon panier</h2>
          <span className="h-9 w-9" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {cart.items.length === 0 ? (
            <div className="pt-10">
              <EmptyState title="Panier vide" description="Ajoutez des produits depuis le catalogue." />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cart.items.map((item) => (
                <div key={item.variantId} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                  <Link
                    to={`/produit/${item.productSlug}`}
                    onClick={cart.closeCart}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100"
                  >
                    {item.imageUrl && <img src={resolveMediaUrl(item.imageUrl)} alt="" className="h-full w-full object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.productName}</p>
                      <PriceTag amount={item.unitPrice * item.quantity} className="shrink-0 text-sm font-semibold text-slate-900" />
                    </div>
                    <p className="mt-0.5 flex justify-between text-xs text-slate-400">
                      <span>Variante</span>
                      <span className="text-slate-500">{item.variantLabel}</span>
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantityStepper
                        quantity={item.quantity}
                        max={item.maxStock}
                        size="sm"
                        onChange={(q) => cart.updateQuantity(item.variantId, q)}
                      />
                      <button
                        type="button"
                        onClick={() => cart.removeItem(item.variantId)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                        aria-label="Retirer du panier"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="px-5 pb-6 pt-2">
            <div className="mb-4 grid grid-cols-3 overflow-hidden rounded-2xl bg-brand-500 text-white">
              <div className="px-4 py-4">
                <p className="text-[11px] text-white/70">Sous-total</p>
                <PriceTag amount={cart.totalAmount} className="mt-1 block text-sm font-semibold" />
              </div>
              <div className="border-l border-white/20 px-4 py-4">
                <p className="text-[11px] text-white/70">Livraison</p>
                <span className="mt-1 block text-sm font-semibold">—</span>
              </div>
              <div className="border-l border-white/20 px-4 py-4">
                <p className="text-[11px] text-white/70">Total</p>
                <PriceTag amount={cart.totalAmount} className="mt-1 block text-sm font-semibold" />
              </div>
            </div>
            <p className="mb-3 text-center text-[11px] text-slate-400">Frais de livraison calcules selon votre wilaya a l'etape suivante.</p>
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="w-full rounded-full bg-brand-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
            >
              Commander
            </button>
          </div>
        )}
      </div>

      {checkoutOpen && (
        <CheckoutModal
          lines={cart.items.map((item) => ({
            variantId: item.variantId,
            productName: item.productName,
            variantLabel: item.variantLabel,
            imageUrl: item.imageUrl,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            maxStock: item.maxStock,
          }))}
          onQuantityChange={cart.updateQuantity}
          onRemove={cart.removeItem}
          onClose={() => setCheckoutOpen(false)}
          onOrderPlaced={() => {
            cart.clear();
            cart.closeCart();
          }}
        />
      )}
    </div>
  );
}
