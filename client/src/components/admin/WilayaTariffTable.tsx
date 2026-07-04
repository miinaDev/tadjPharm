import { useState } from "react";
import type { Wilaya } from "../../types";
import { IconTrash } from "../ui/icons";

type PriceField = "homePrice" | "officePrice";

interface WilayaTariffTableProps {
  wilayas: Wilaya[];
  onUpdate: (id: number, payload: { homePrice?: number; officePrice?: number; isActive?: boolean }) => void;
  onManageBureaus: (wilaya: Wilaya) => void;
  onDelete: (wilaya: Wilaya) => void;
}

export function WilayaTariffTable({ wilayas, onUpdate, onManageBureaus, onDelete }: WilayaTariffTableProps) {
  const [editing, setEditing] = useState<{ id: number; field: PriceField } | null>(null);
  const [draft, setDraft] = useState("");

  function startEdit(wilaya: Wilaya, field: PriceField) {
    setEditing({ id: wilaya.id, field });
    setDraft(String(wilaya[field]));
  }

  function saveEdit() {
    if (!editing) return;
    const price = Number(draft);
    if (!Number.isNaN(price) && price >= 0) {
      onUpdate(editing.id, { [editing.field]: price });
    }
    setEditing(null);
  }

  function priceCell(wilaya: Wilaya, field: PriceField) {
    const isEditing = editing?.id === wilaya.id && editing.field === field;
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
            className="w-24 rounded-md border border-brand-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <span className="text-xs text-slate-400">DA</span>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => startEdit(wilaya, field)}
        className="rounded-md px-2 py-1 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
      >
        {wilaya[field].toLocaleString("fr-FR")} DA
      </button>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Code</th>
            <th className="px-4 py-3 font-medium">Wilaya</th>
            <th className="px-4 py-3 font-medium">Prix domicile</th>
            <th className="px-4 py-3 font-medium">Prix bureau</th>
            <th className="px-4 py-3 font-medium">Bureaux</th>
            <th className="px-4 py-3 font-medium">Active</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {wilayas.map((wilaya) => (
            <tr key={wilaya.id} className={`transition-colors hover:bg-slate-50 ${!wilaya.isActive ? "opacity-50" : ""}`}>
              <td className="px-4 py-3 text-slate-400">{wilaya.id}</td>
              <td className="px-4 py-3 font-medium text-slate-900">{wilaya.name}</td>
              <td className="px-4 py-3">{priceCell(wilaya, "homePrice")}</td>
              <td className="px-4 py-3">{priceCell(wilaya, "officePrice")}</td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onManageBureaus(wilaya)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                >
                  {wilaya.bureaus.length} bureau{wilaya.bureaus.length > 1 ? "x" : ""} · Gerer
                </button>
              </td>
              <td className="px-4 py-3">
                <span
                  role="switch"
                  aria-checked={wilaya.isActive}
                  onClick={() => onUpdate(wilaya.id, { isActive: !wilaya.isActive })}
                  className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${
                    wilaya.isActive ? "bg-brand-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                    style={{ transform: wilaya.isActive ? "translateX(18px)" : "translateX(4px)" }}
                  />
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(wilaya)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Supprimer la wilaya"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
