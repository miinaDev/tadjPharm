import type { ReactNode } from "react";
import type { Order, OrderItem } from "../../types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { PriceTag } from "../product/PriceTag";
import { IconClose } from "../ui/icons";

function variantLabel(item: OrderItem) {
  const parts = [item.variant.color?.label, item.variant.size?.label, item.variant.volume?.label].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Standard";
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      {children}
    </div>
  );
}

export function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const subtotal = order.items.reduce((sum, item) => sum + item.unitPriceSnapshot * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Details de la commande</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString("fr-FR")}</span>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="flex flex-col gap-3">
          <Section title="Client">
            <Row label="Prenom" value={order.firstName} />
            <Row label="Nom" value={order.lastName} />
            <Row label="Email" value={order.email} />
            <Row label="Telephone" value={order.phone} />
            <Row label="Wilaya" value={order.wilaya.name} />
          </Section>

          <Section title={`Article${order.items.length > 1 ? "s" : ""}`}>
            <div className="flex flex-col divide-y divide-slate-200">
              {order.items.map((item) => (
                <div key={item.id} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-900">{item.variant.product.name}</span>
                    <PriceTag amount={item.unitPriceSnapshot * item.quantity} className="font-medium text-slate-900" />
                  </div>
                  <p className="text-xs text-slate-400">
                    {variantLabel(item)} &middot; {item.quantity} &times; <PriceTag amount={item.unitPriceSnapshot} />
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Paiement (a la livraison)">
            <Row label="Sous-total" value={<PriceTag amount={subtotal} />} />
            <Row label="Livraison" value={<PriceTag amount={order.deliveryFeeSnapshot} />} />
            <div className="mt-1 flex justify-between border-t border-slate-200 pt-1.5 text-sm font-semibold text-slate-900">
              <span>Total</span>
              <PriceTag amount={order.totalSnapshot} />
            </div>
          </Section>
        </div>

        <p className="mt-3 break-all text-center text-[11px] text-slate-300">Reference : {order.id}</p>
      </div>
    </div>
  );
}
