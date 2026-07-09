import { comboKey, comboLabel, type VariantCombo } from "../../utils/variants";

export interface VariantRowValue {
  priceOverride: string;
}

interface VariantMatrixBuilderProps {
  combos: VariantCombo[];
  values: Record<string, VariantRowValue>;
  onChange: (key: string, patch: Partial<VariantRowValue>) => void;
  basePrice: number;
}

export function VariantMatrixBuilder({ combos, values, onChange, basePrice }: VariantMatrixBuilderProps) {
  if (combos.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Combinaison</th>
            <th className="px-3 py-2">Prix (optionnel)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {combos.map((combo) => {
            const key = comboKey(combo);
            const value = values[key] ?? { priceOverride: "" };
            return (
              <tr key={key}>
                <td className="px-3 py-2 font-medium text-slate-800">{comboLabel(combo)}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={value.priceOverride}
                    onChange={(e) => onChange(key, { priceOverride: e.target.value })}
                    placeholder={`${basePrice || 0} (prix de base)`}
                    className="w-32 rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
