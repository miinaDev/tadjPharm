import { useState } from "react";
import type { Wilaya } from "../../types";

interface WilayaTariffTableProps {
  wilayas: Wilaya[];
  onUpdate: (id: number, payload: { deliveryPrice?: number; isActive?: boolean }) => void;
}

export function WilayaTariffTable({ wilayas, onUpdate }: WilayaTariffTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftPrice, setDraftPrice] = useState("");

  function startEdit(wilaya: Wilaya) {
    setEditingId(wilaya.id);
    setDraftPrice(String(wilaya.deliveryPrice));
  }

  function saveEdit(id: number) {
    const price = Number(draftPrice);
    if (!Number.isNaN(price) && price >= 0) {
      onUpdate(id, { deliveryPrice: price });
    }
    setEditingId(null);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Code</th>
            <th className="px-4 py-3 font-medium">Wilaya</th>
            <th className="px-4 py-3 font-medium">Tarif livraison</th>
            <th className="px-4 py-3 font-medium">Active</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {wilayas.map((wilaya) => (
            <tr key={wilaya.id} className={`transition-colors hover:bg-slate-50 ${!wilaya.isActive ? "opacity-50" : ""}`}>
              <td className="px-4 py-3 text-slate-400">{wilaya.id}</td>
              <td className="px-4 py-3 font-medium text-slate-900">{wilaya.name}</td>
              <td className="px-4 py-3">
                {editingId === wilaya.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      autoFocus
                      value={draftPrice}
                      onChange={(e) => setDraftPrice(e.target.value)}
                      onBlur={() => saveEdit(wilaya.id)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(wilaya.id)}
                      className="w-24 rounded-md border border-brand-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                    <span className="text-xs text-slate-400">DA</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(wilaya)}
                    className="rounded-md px-2 py-1 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {wilaya.deliveryPrice.toLocaleString("fr-FR")} DA
                  </button>
                )}
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
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      wilaya.isActive ? "translate-x-4.5" : "translate-x-1"
                    }`}
                    style={{ transform: wilaya.isActive ? "translateX(18px)" : "translateX(4px)" }}
                  />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
