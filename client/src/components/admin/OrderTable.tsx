import { useState } from "react";
import type { Order, OrderStatus } from "../../types";
import { StatusSelect } from "./OrderStatusBadge";
import { PriceTag } from "../product/PriceTag";
import { EmptyState } from "../common/EmptyState";

interface OrderTableProps {
  orders: Order[];
  onStatusChange: (id: string, status: OrderStatus) => void;
  onNoteChange: (id: string, note: string) => void;
  onRowClick: (order: Order) => void;
}

function productSummary(order: Order) {
  if (order.items.length === 0) return "-";
  const first = order.items[0].productNameSnapshot || order.items[0].variant?.product?.name || "Produit supprime";
  if (order.items.length === 1) return first;
  return `${first} +${order.items.length - 1} autre${order.items.length > 2 ? "s" : ""}`;
}

// Champ note editable directement dans le tableau : enregistre a la perte de focus (ou touche Entree) si modifie.
function NoteCell({ order, onNoteChange }: { order: Order; onNoteChange: (id: string, note: string) => void }) {
  const [note, setNote] = useState(order.adminNote ?? "");
  const dirty = note !== (order.adminNote ?? "");
  return (
    <input
      type="text"
      value={note}
      onChange={(e) => setNote(e.target.value)}
      onBlur={() => {
        if (dirty) onNoteChange(order.id, note);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      maxLength={2000}
      placeholder="Ajouter une note..."
      className="w-full min-w-[180px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
    />
  );
}

export function OrderTable({ orders, onStatusChange, onNoteChange, onRowClick }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="p-6">
        <EmptyState title="Aucune commande" description="Les nouvelles commandes apparaitront ici." />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-4 py-3 font-medium">Produit</th>
            <th className="px-4 py-3 font-medium">Wilaya</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => (
            <tr key={order.id} onClick={() => onRowClick(order)} className="cursor-pointer transition-colors hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {new Date(order.createdAt).toLocaleDateString("fr-FR")}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">
                  {order.firstName} {order.lastName}
                </p>
                <p className="text-xs text-slate-400">{order.phone}</p>
              </td>
              <td className="px-4 py-3 text-slate-600">{productSummary(order)}</td>
              <td className="px-4 py-3 text-slate-600">{order.wilayaNameSnapshot || order.wilaya?.name || "-"}</td>
              <td className="px-4 py-3 font-medium text-slate-900">
                <PriceTag amount={order.totalSnapshot} />
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <StatusSelect status={order.status} onChange={(status) => onStatusChange(order.id, status)} />
              </td>
              <td className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                <NoteCell order={order} onNoteChange={onNoteChange} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
