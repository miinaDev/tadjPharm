import { useState } from "react";
import type { Product } from "../../types";
import { useAddOption, useRemoveOption } from "../../hooks/useAdminProducts";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { IconPlus } from "../ui/icons";

type OptionType = "color" | "size" | "volume";

const LABELS: Record<OptionType, string> = { color: "Couleurs", size: "Tailles", volume: "Volumes / contenance" };
const PLACEHOLDERS: Record<OptionType, string> = {
  color: "Ex: Rouge",
  size: "Ex: M",
  volume: "Ex: 250ml",
};

function optionsFor(product: Product, type: OptionType) {
  if (type === "color") return product.colors;
  if (type === "size") return product.sizes;
  return product.volumes;
}

function OptionGroup({ product, type }: { product: Product; type: OptionType }) {
  const addOption = useAddOption(product.id);
  const removeOption = useRemoveOption(product.id);
  const [draft, setDraft] = useState("");
  const values = optionsFor(product, type);

  async function handleAdd() {
    const label = draft.trim();
    if (!label) return;
    await addOption.mutateAsync({ type, label });
    setDraft("");
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{LABELS[type]}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {values.map((opt) => (
          <span key={opt.id} className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
            {opt.label}
            <button
              type="button"
              onClick={() => removeOption.mutate({ type, optionId: opt.id })}
              className="text-slate-400 hover:text-red-600"
            >
              &times;
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder={PLACEHOLDERS[type]}
            className="w-28 rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!draft.trim() || addOption.isPending}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Ajouter"
          >
            <IconPlus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {values.length === 0 && <p className="mt-1 text-xs text-slate-400">Ajoutez une valeur pour activer cette option.</p>}
    </div>
  );
}

export function ProductOptionsManager({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader title="Options du produit" description="Ajoutez des valeurs pour activer une option (couleur, taille, volume)" />
      <CardBody className="flex flex-col gap-4">
        <OptionGroup product={product} type="color" />
        <div className="border-t border-slate-100 pt-4">
          <OptionGroup product={product} type="size" />
        </div>
        <div className="border-t border-slate-100 pt-4">
          <OptionGroup product={product} type="volume" />
        </div>
      </CardBody>
    </Card>
  );
}
