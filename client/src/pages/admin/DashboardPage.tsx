import { useState, type ComponentType, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAdminStats } from "../../hooks/useAdminStats";
import { OrderDetailModal } from "../../components/admin/OrderDetailModal";
import { OrderStatusBadge } from "../../components/admin/OrderStatusBadge";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { PriceTag } from "../../components/product/PriceTag";
import { IconOrders, IconGrid, IconAlert, IconBox } from "../../components/ui/icons";
import type { Order } from "../../types";

function productSummary(order: Order) {
  if (order.items.length === 0) return "-";
  const first = order.items[0].productNameSnapshot || order.items[0].variant?.product?.name || "Produit supprime";
  if (order.items.length === 1) return first;
  return `${first} +${order.items.length - 1}`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  to,
  tone = "brand",
}: {
  label: string;
  value: ReactNode;
  icon: ComponentType<{ className?: string }>;
  sub?: ReactNode;
  to?: string;
  tone?: "brand" | "amber";
}) {
  const iconClasses = tone === "amber" ? "bg-amber-100 text-amber-700" : "bg-brand-100 text-brand-700";
  const content = (
    <div className="flex h-full items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
        {sub && <div className="mt-1 text-xs">{sub}</div>}
      </div>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
  return to ? (
    <Link to={to} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}

function TrendBadge({ month, prev }: { month: number; prev: number }) {
  if (prev === 0) {
    return <span className="text-slate-400">{month > 0 ? "Premier mois d'activite" : "Aucune activite le mois dernier"}</span>;
  }
  const pct = Math.round(((month - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className={up ? "font-medium text-green-600" : "font-medium text-red-600"}>
      {up ? "▲" : "▼"} {Math.abs(pct)}% vs mois dernier
    </span>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading } = useAdminStats();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Tableau de bord" description="Vue d'ensemble de l'activite" />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Nouvelles a traiter"
          value={stats.newOrders}
          icon={IconOrders}
          tone="amber"
          sub={<span className="text-slate-400">a confirmer par telephone</span>}
          to="/admin/commandes"
        />
        <StatCard
          label="Commandes ce mois"
          value={stats.monthOrders}
          icon={IconGrid}
          sub={<TrendBadge month={stats.monthOrders} prev={stats.prevMonthOrders} />}
        />
        <StatCard
          label="Chiffre d'affaires (mois)"
          value={<PriceTag amount={stats.monthRevenue} />}
          icon={IconBox}
          sub={<span className="text-slate-400">commandes non annulees</span>}
        />
        <StatCard
          label="Panier moyen (mois)"
          value={<PriceTag amount={Math.round(stats.monthAvgBasket)} />}
          icon={IconBox}
        />
      </div>

      {/* Detail */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Dernieres commandes */}
        <Card className="min-w-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Dernieres commandes</h2>
            <Link to="/admin/commandes" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Tout voir
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState title="Aucune commande" description="Les nouvelles commandes apparaitront ici." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Date</th>
                    <th className="px-4 py-2.5 font-medium">Client</th>
                    <th className="px-4 py-2.5 font-medium">Produit</th>
                    <th className="px-4 py-2.5 font-medium">Total</th>
                    <th className="px-4 py-2.5 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-slate-900">{order.fullName}</p>
                        <p className="text-xs text-slate-400">{order.phone}</p>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{productSummary(order)}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-900">
                        <PriceTag amount={order.totalSnapshot} />
                      </td>
                      <td className="px-4 py-2.5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Produits non disponibles */}
        <Card className="min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <IconAlert className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-900">Produits non disponibles</h2>
            </div>
            {stats.unavailableCount > 0 && (
              <Badge tone="red">{stats.unavailableCount} produit{stats.unavailableCount > 1 ? "s" : ""}</Badge>
            )}
          </div>
          {stats.unavailable.length === 0 ? (
            <div className="p-6">
              <EmptyState title="Tout est disponible" description="Aucun produit actif marque comme non disponible." />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.unavailable.map((item) => (
                <li key={item.productId}>
                  <Link
                    to={`/admin/produits/${item.productId}`}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50"
                  >
                    <p className="truncate text-sm font-medium text-slate-800">{item.productName}</p>
                    <Badge tone="red">Non disponible</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}
