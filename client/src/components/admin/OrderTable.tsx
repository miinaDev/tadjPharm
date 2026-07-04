import type { Order, OrderStatus } from "../../types";
import { StatusSelect } from "./OrderStatusBadge";
import { PriceTag } from "../product/PriceTag";
import { EmptyState } from "../common/EmptyState";

interface OrderTableProps {
  orders: Order[];
  onStatusChange: (id: string, status: OrderStatus) => void;
  onRowClick: (order: Order) => void;
}

function productSummary(order: Order) {
  if (order.items.length === 0) return "-";
  const first = order.items[0].productNameSnapshot || order.items[0].variant?.product?.name || "Produit supprime";
  if (order.items.length === 1) return first;
  return `${first} +${order.items.length - 1} autre${order.items.length > 2 ? "s" : ""}`;
}

export function OrderTable({ orders, onStatusChange, onRowClick }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="p-6">
        <EmptyState title="Aucune commande" description="Les nouvelles commandes apparaitront ici." />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-4 py-3 font-medium">Produit</th>
            <th className="px-4 py-3 font-medium">Wilaya</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Statut</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
