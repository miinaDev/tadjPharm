import { useState } from "react";
import { useAdminOrders, useUpdateOrderNote, useUpdateOrderStatus } from "../../hooks/useAdminOrders";
import { OrderTable } from "../../components/admin/OrderTable";
import { OrderDetailModal } from "../../components/admin/OrderDetailModal";
import { ORDER_STATUS_OPTIONS } from "../../components/admin/OrderStatusBadge";
import { Spinner } from "../../components/common/Spinner";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Input, Select } from "../../components/ui/Field";
import { IconSearch } from "../../components/ui/icons";
import type { OrderStatus } from "../../types";

export function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { data, isLoading } = useAdminOrders({ status: status || undefined, search: search || undefined });
  const updateStatus = useUpdateOrderStatus();
  const updateNote = useUpdateOrderNote();

  const selectedOrder = data?.orders.find((o) => o.id === selectedOrderId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Commandes" description={data ? `${data.total} commande${data.total > 1 ? "s" : ""}` : undefined} />

      <Card>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-3">
          <div className="relative min-w-[220px] flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher (nom, telephone)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "")} className="w-auto">
            <option value="">Tous les statuts</option>
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <OrderTable
            orders={data?.orders ?? []}
            onStatusChange={(id, newStatus) => updateStatus.mutate({ id, status: newStatus })}
            onNoteChange={(id, note) => updateNote.mutate({ id, note })}
            onRowClick={(order) => setSelectedOrderId(order.id)}
          />
        )}
      </Card>

      {selectedOrder && (
        <OrderDetailModal key={selectedOrder.id} order={selectedOrder} onClose={() => setSelectedOrderId(null)} />
      )}
    </div>
  );
}
