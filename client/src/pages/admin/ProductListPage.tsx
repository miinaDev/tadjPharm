import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminProducts, useDeleteProduct, useDeleteProducts } from "../../hooks/useAdminProducts";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PriceTag } from "../../components/product/PriceTag";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input, Select } from "../../components/ui/Field";
import { IconPencil, IconPlus, IconSearch, IconTrash } from "../../components/ui/icons";
import { resolveMediaUrl } from "../../api/client";

function HeaderCheckbox({ checked, indeterminate, onChange }: { checked: boolean; indeterminate: boolean; onChange: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30" />;
}

export function ProductListPage() {
  const { data, isLoading } = useAdminProducts();
  const deleteProduct = useDeleteProduct();
  const deleteProducts = useDeleteProducts();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const activeCount = data?.products.filter((p) => p.isActive).length ?? 0;
  const inactiveCount = data?.products.filter((p) => !p.isActive).length ?? 0;

  const products = useMemo(() => {
    let list = data?.products ?? [];
    if (statusFilter === "active") list = list.filter((p) => p.isActive);
    if (statusFilter === "inactive") list = list.filter((p) => !p.isActive);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.name.toLowerCase().includes(q));
    }
    return list;
  }, [data, search, statusFilter]);

  const visibleIds = useMemo(() => products.map((p) => p.id), [products]);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  function toggleOne(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Produits"
        description={data ? `${data.total} produit${data.total > 1 ? "s" : ""} au catalogue` : undefined}
        action={
          <Link to="/admin/produits/nouveau">
            <Button variant="primary">
              <IconPlus className="h-4 w-4" /> Nouveau produit
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : data && data.products.length > 0 ? (
        <Card>
          {selectedIds.size > 0 ? (
            <div className="flex items-center justify-between gap-3 border-b border-brand-100 bg-brand-50 px-4 py-2.5">
              <p className="text-sm font-medium text-brand-800">
                {selectedIds.size} produit{selectedIds.size > 1 ? "s" : ""} selectionne{selectedIds.size > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
                  Annuler
                </Button>
                <Button type="button" variant="danger" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                  <IconTrash className="h-3.5 w-3.5" /> Supprimer
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 border-b border-slate-100 p-3">
              <div className="relative min-w-[220px] flex-1">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="w-auto"
              >
                <option value="all">Tous les produits ({(data?.products.length ?? 0)})</option>
                <option value="active">Actifs uniquement ({activeCount})</option>
                <option value="inactive">Inactifs uniquement ({inactiveCount})</option>
              </Select>
            </div>
          )}

          {products.length === 0 ? (
            <div className="p-6">
              <EmptyState title="Aucun resultat" description="Essayez un autre terme de recherche." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <HeaderCheckbox checked={allVisibleSelected} indeterminate={someVisibleSelected} onChange={toggleAllVisible} />
                    </th>
                    <th className="px-4 py-3 font-medium">Produit</th>
                    <th className="px-4 py-3 font-medium">Categorie</th>
                    <th className="px-4 py-3 font-medium">Prix</th>
                    <th className="px-4 py-3 font-medium">Stock total</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
                    const image = product.images[0];
                    const isSelected = selectedIds.has(product.id);
                    return (
                      <tr key={product.id} className={`transition-colors hover:bg-slate-50 ${isSelected ? "bg-brand-50/60" : ""}`}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOne(product.id)}
                            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                              {image && <img src={resolveMediaUrl(image.url)} alt="" className="h-full w-full object-cover" />}
                            </div>
                            <span className="font-medium text-slate-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{product.category.name}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          <PriceTag amount={product.basePrice} />
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={totalStock === 0 ? "red" : totalStock <= 5 ? "amber" : "slate"}>{totalStock} unites</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={product.isActive ? "green" : "slate"}>{product.isActive ? "Actif" : "Inactif"}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Link
                              to={`/admin/produits/${product.id}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-brand-700"
                              aria-label="Modifier"
                            >
                              <IconPencil className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(product.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                              aria-label="Supprimer"
                            >
                              <IconTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <EmptyState title="Aucun produit" description="Commencez par ajouter un produit ou importer un fichier Excel." />
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Supprimer ce produit ?"
        description="Si le produit a des commandes existantes, il sera simplement desactive."
        confirmLabel="Supprimer"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) deleteProduct.mutate(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Supprimer ${selectedIds.size} produit${selectedIds.size > 1 ? "s" : ""} ?`}
        description="Les produits ayant des commandes existantes seront simplement desactives."
        confirmLabel="Supprimer"
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={() => {
          deleteProducts.mutate(Array.from(selectedIds));
          setBulkDeleteOpen(false);
          clearSelection();
        }}
      />
    </div>
  );
}
