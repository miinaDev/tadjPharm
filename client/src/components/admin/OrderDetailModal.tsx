import { useState, type ReactNode } from "react";
import type { Order } from "../../types";
import { useUpdateOrderDeliveryFee, useUpdateOrderNote } from "../../hooks/useAdminOrders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { PriceTag } from "../product/PriceTag";
import { IconClose } from "../ui/icons";

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

  const updateNote = useUpdateOrderNote();
  const [note, setNote] = useState(order.adminNote ?? "");
  const noteDirty = note !== (order.adminNote ?? "");

  // Tarif de livraison editable (notamment pour les commandes a livraison speciale, laissees
  // en attente a la creation). Le total est recalcule en direct a partir du sous-total.
  const updateFee = useUpdateOrderDeliveryFee();
  const [fee, setFee] = useState(String(order.deliveryFeeSnapshot));
  const parsedFee = fee.trim() === "" ? NaN : Number(fee);
  const feeValid = Number.isFinite(parsedFee) && parsedFee >= 0;
  const feeDirty = feeValid && parsedFee !== order.deliveryFeeSnapshot;
  const liveTotal = subtotal + (feeValid ? parsedFee : order.deliveryFeeSnapshot);

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
            <Row label="Nom" value={order.fullName} />
            <Row label="Telephone" value={order.phone} />
            <Row label="Wilaya" value={order.wilayaNameSnapshot || order.wilaya?.name || "-"} />
          </Section>

          <Section title="Livraison">
            <Row label="Mode" value={order.shippingMethod === "OFFICE" ? "Au bureau" : "A domicile"} />
            {order.shippingMethod === "OFFICE" ? (
              <Row label="Bureau" value={order.bureau?.name ?? order.bureauNameSnapshot ?? "-"} />
            ) : (
              <Row label="Adresse" value={order.address || "-"} />
            )}
          </Section>

          <Section title={`Article${order.items.length > 1 ? "s" : ""}`}>
            <div className="flex flex-col divide-y divide-slate-200">
              {order.items.map((item) => (
                <div key={item.id} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-900">
                      {item.productNameSnapshot || item.variant?.product?.name || "Produit supprime"}
                    </span>
                    <PriceTag amount={item.unitPriceSnapshot * item.quantity} className="font-medium text-slate-900" />
                  </div>
                  <p className="text-xs text-slate-400">
                    {item.variantLabelSnapshot || "Standard"} &middot; {item.quantity} &times;{" "}
                    <PriceTag amount={item.unitPriceSnapshot} />
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Paiement (a la livraison)">
            <Row label="Sous-total" value={<PriceTag amount={subtotal} />} />

            <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
              <span className="text-slate-500">
                Livraison
                {order.specialDelivery && order.deliveryFeeSnapshot === 0 && (
                  <span className="ml-1 font-medium text-amber-600">(a definir)</span>
                )}
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="h-8 w-24 rounded-lg border border-slate-200 bg-white px-2 text-right text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs text-slate-400">DA</span>
              </div>
            </div>

            <div className="mt-1 flex justify-between border-t border-slate-200 pt-1.5 text-sm font-semibold text-slate-900">
              <span>Total</span>
              <PriceTag amount={liveTotal} />
            </div>

            <div className="mt-2 flex items-center justify-end gap-2">
              {feeDirty && !updateFee.isPending && <span className="text-xs text-amber-600">Non enregistre</span>}
              <button
                type="button"
                onClick={() => updateFee.mutate({ id: order.id, deliveryFee: parsedFee })}
                disabled={!feeDirty || updateFee.isPending}
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updateFee.isPending ? "Enregistrement..." : "Enregistrer le tarif"}
              </button>
            </div>
          </Section>

          <Section title="Note interne">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Ajouter une note (visible uniquement par l'admin)..."
              className="w-full resize-y rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              {noteDirty && !updateNote.isPending && <span className="text-xs text-amber-600">Non enregistre</span>}
              <button
                type="button"
                onClick={() => updateNote.mutate({ id: order.id, note })}
                disabled={!noteDirty || updateNote.isPending}
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updateNote.isPending ? "Enregistrement..." : "Enregistrer la note"}
              </button>
            </div>
          </Section>
        </div>

        <p className="mt-3 break-all text-center text-[11px] text-slate-300">Reference : {order.id}</p>
      </div>
    </div>
  );
}
