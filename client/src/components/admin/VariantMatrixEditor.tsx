import { useState } from "react";
import type { Product } from "../../types";
import { useCreateVariant, useDeleteVariant, useUpdateVariant } from "../../hooks/useAdminProducts";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Select } from "../ui/Field";
import { IconPlus, IconTrash } from "../ui/icons";

function variantLabel(variant: Product["variants"][number]) {
  const parts = [variant.color?.label, variant.size?.label, variant.volume?.label].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Standard";
}

export function VariantMatrixEditor({ product }: { product: Product }) {
  const createVariant = useCreateVariant(product.id);
  const updateVariant = useUpdateVariant(product.id);
  const deleteVariant = useDeleteVariant(product.id);

  const [colorId, setColorId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [volumeId, setVolumeId] = useState("");
  const [priceOverride, setPriceOverride] = useState("");
  const [error, setError] = useState<string | null>(null);

  const hasAnyOption = product.hasColors || product.hasSizes || product.hasVolumes;
  if (!hasAnyOption) {
    return null;
  }

  async function handleAdd() {
    setError(null);
    if ((product.hasColors && !colorId) || (product.hasSizes && !sizeId) || (product.hasVolumes && !volumeId)) {
      setError("Veuillez selectionner une valeur pour chaque option activee");
      return;
    }
    try {
      await createVariant.mutateAsync({
        colorId: product.hasColors ? colorId : null,
        sizeId: product.hasSizes ? sizeId : null,
        volumeId: product.hasVolumes ? volumeId : null,
        priceOverride: priceOverride ? Number(priceOverride) : null,
      });
      setColorId("");
      setSizeId("");
      setVolumeId("");
      setPriceOverride("");
    } catch {
      setError("Cette combinaison existe peut-etre deja");
    }
  }

  return (
    <Card>
      <CardHeader title="Variantes" description="Les combinaisons couleur/taille/volume proposees, avec un prix optionnel par combinaison" />
      <CardBody className="flex flex-col gap-4">
        {product.variants.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Combinaison</th>
                  <th className="px-3 py-2">Prix</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {product.variants.map((variant) => (
                  <tr key={variant.id}>
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
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => deleteVariant.mutate(variant.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Supprimer la variante"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-3">
          {product.hasColors && (
            <Select value={colorId} onChange={(e) => setColorId(e.target.value)} className="w-auto">
              <option value="">Couleur...</option>
              {product.colors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          )}
          {product.hasSizes && (
            <Select value={sizeId} onChange={(e) => setSizeId(e.target.value)} className="w-auto">
              <option value="">Taille...</option>
              {product.sizes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          )}
          {product.hasVolumes && (
            <Select value={volumeId} onChange={(e) => setVolumeId(e.target.value)} className="w-auto">
              <option value="">Volume...</option>
              {product.volumes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </Select>
          )}
          <input
            type="number"
            min={0}
            step="0.01"
            value={priceOverride}
            onChange={(e) => setPriceOverride(e.target.value)}
            placeholder="Prix (optionnel)"
            className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
          <Button type="button" variant="primary" onClick={handleAdd} disabled={createVariant.isPending}>
            <IconPlus className="h-4 w-4" /> Ajouter
          </Button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </CardBody>
    </Card>
  );
}
