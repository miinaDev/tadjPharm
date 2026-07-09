import type { Product } from "../../types";

export interface VariantSelection {
  colorId: string | null;
  sizeId: string | null;
  volumeId: string | null;
}

interface VariantSelectorProps {
  product: Product;
  selection: VariantSelection;
  onChange: (patch: Partial<VariantSelection>) => void;
}

// Une option est proposable s'il existe une variante (combinaison) correspondante.
// Plus de notion de stock : la disponibilite a la commande est geree au niveau du produit.
function isOptionAvailable(product: Product, patch: Partial<VariantSelection>, selection: VariantSelection) {
  const candidate = { ...selection, ...patch };
  return product.variants.some(
    (v) =>
      (candidate.colorId === null || v.colorId === candidate.colorId) &&
      (candidate.sizeId === null || v.sizeId === candidate.sizeId) &&
      (candidate.volumeId === null || v.volumeId === candidate.volumeId)
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm font-semibold text-slate-800">{children}</p>;
}

export function VariantSelector({ product, selection, onChange }: VariantSelectorProps) {
  return (
    <div className="flex flex-col gap-6">
      {product.hasColors && (
        <div>
          <SectionLabel>Couleur</SectionLabel>
          <div className="flex flex-wrap gap-5">
            {product.colors.map((color) => {
              const active = selection.colorId === color.id;
              const available = isOptionAvailable(product, { colorId: color.id }, selection);
              return (
                <button
                  key={color.id}
                  type="button"
                  disabled={!available}
                  onClick={() => onChange({ colorId: color.id })}
                  title={color.label}
                  className="flex flex-col items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span
                    className={`h-9 w-9 rounded-full transition ${
                      active ? "ring-2 ring-brand-500 ring-offset-2" : "ring-1 ring-slate-200"
                    }`}
                    style={{ backgroundColor: color.hexCode ?? "#cbd5e1" }}
                  />
                  <span className={`text-xs ${active ? "font-medium text-slate-700" : "text-slate-400"}`}>
                    {color.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {product.hasSizes && (
        <div>
          <SectionLabel>Taille</SectionLabel>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => {
              const active = selection.sizeId === size.id;
              const available = isOptionAvailable(product, { sizeId: size.id }, selection);
              return (
                <button
                  key={size.id}
                  type="button"
                  disabled={!available}
                  onClick={() => onChange({ sizeId: size.id })}
                  className={`flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-30 ${
                    active
                      ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {size.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {product.hasVolumes && (
        <div>
          <SectionLabel>Contenance</SectionLabel>
          <div className="flex flex-wrap gap-3">
            {product.volumes.map((volume) => {
              const active = selection.volumeId === volume.id;
              const available = isOptionAvailable(product, { volumeId: volume.id }, selection);
              return (
                <button
                  key={volume.id}
                  type="button"
                  disabled={!available}
                  onClick={() => onChange({ volumeId: volume.id })}
                  className={`flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-30 ${
                    active
                      ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {volume.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function resolveSelectedVariant(product: Product, selection: VariantSelection) {
  return product.variants.find(
    (v) => v.colorId === selection.colorId && v.sizeId === selection.sizeId && v.volumeId === selection.volumeId
  );
}
