import type { Product } from "../../types";
import { useUpdateVariant } from "../../hooks/useAdminProducts";
import { Card, CardBody, CardHeader } from "../ui/Card";

function variantLabel(variant: Product["variants"][number]) {
  const parts = [variant.color?.label, variant.size?.label, variant.volume?.label].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Standard";
}

export function VariantMatrixEditor({ product }: { product: Product }) {
  const updateVariant = useUpdateVariant(product.id);

  const hasAnyOption = product.hasColors || product.hasSizes || product.hasVolumes;
  if (!hasAnyOption) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        title="Variantes"
        description="Toutes les combinaisons sont generees automatiquement. Desactivez celles que vous ne proposez pas et fixez un prix specifique si besoin. Pour en retirer une, supprimez l'option correspondante ci-dessus."
      />
      <CardBody>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Combinaison</th>
                <th className="px-3 py-2">Prix</th>
                <th className="px-3 py-2">Actif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {product.variants.map((variant) => (
                <tr key={variant.id} className={variant.isActive ? "" : "opacity-50"}>
                  <td className="px-3 py-2 font-medium text-slate-800">{variantLabel(variant)}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      defaultValue={variant.priceOverride ?? ""}
                      placeholder={`${product.basePrice} (prix de base)`}
                      onBlur={(e) => {
                        const raw = e.target.value;
                        const value = raw === "" ? null : Number(raw);
                        if (value !== variant.priceOverride && !(value !== null && Number.isNaN(value))) {
                          updateVariant.mutate({ variantId: variant.id, priceOverride: value });
                        }
                      }}
                      className="w-28 rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={variant.isActive}
                      aria-label="Activer cette combinaison"
                      onClick={() => updateVariant.mutate({ variantId: variant.id, isActive: !variant.isActive })}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        variant.isActive ? "bg-brand-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className="inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform"
                        style={{ transform: variant.isActive ? "translateX(22px)" : "translateX(4px)" }}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
