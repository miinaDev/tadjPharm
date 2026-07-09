import { Link } from "react-router-dom";
import type { Product, ProductVariant } from "../../types";
import { PriceTag } from "../product/PriceTag";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { IconClose, IconPencil } from "../ui/icons";
import { resolveMediaUrl } from "../../api/client";

function variantLabel(variant: ProductVariant) {
  const parts = [variant.color?.label, variant.size?.label, variant.volume?.label].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Standard";
}

export function ProductDetailModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const hasAnyOption = product.hasColors || product.hasSizes || product.hasVolumes;
  const image = product.images[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Details du produit</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            {image && <img src={resolveMediaUrl(image.url, 240)} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">{product.name}</p>
            <p className="mt-0.5 text-sm text-slate-500">{product.category.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PriceTag amount={product.basePrice} className="font-semibold text-slate-900" />
              <Badge tone={product.isActive ? "green" : "slate"}>{product.isActive ? "Actif" : "Inactif"}</Badge>
              <Badge tone={product.isAvailable ? "green" : "red"}>{product.isAvailable ? "Disponible" : "Non disponible"}</Badge>
            </div>
          </div>
        </div>

        {product.description && (
          <p className="mt-4 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{product.description}</p>
        )}

        {hasAnyOption && (
          <>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Variantes ({product.variants.length})
            </p>
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Combinaison</th>
                    <th className="px-3 py-2 text-right font-medium">Prix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.variants.map((variant) => (
                    <tr key={variant.id}>
                      <td className="px-3 py-2 font-medium text-slate-800">{variantLabel(variant)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">
                        <PriceTag amount={variant.priceOverride ?? product.basePrice} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Fermer
          </Button>
          <Link to={`/admin/produits/${product.id}`}>
            <Button variant="primary">
              <IconPencil className="h-4 w-4" /> Modifier
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
