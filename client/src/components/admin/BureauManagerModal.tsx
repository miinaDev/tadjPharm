import { useState, type FormEvent } from "react";
import type { Wilaya } from "../../types";
import { useCreateBureau, useUpdateBureau, useDeleteBureau } from "../../hooks/useAdminWilayas";
import { Button } from "../ui/Button";
import { Input } from "../ui/Field";
import { Switch } from "../ui/Switch";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { EmptyState } from "../common/EmptyState";
import { IconPlus, IconTrash } from "../ui/icons";

export function BureauManagerModal({ wilaya, onClose }: { wilaya: Wilaya; onClose: () => void }) {
  const createBureau = useCreateBureau();
  const updateBureau = useUpdateBureau();
  const deleteBureau = useDeleteBureau();
  const [name, setName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createBureau.mutate({ wilayaId: wilaya.id, name: trimmed }, { onSuccess: () => setName("") });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Bureaux de livraison</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          {wilaya.id} - {wilaya.name} · prix bureau unique : {wilaya.officePrice.toLocaleString("fr-FR")} DA
        </p>

        {wilaya.bureaus.length === 0 ? (
          <div className="py-6">
            <EmptyState title="Aucun bureau" description="Ajoutez un premier bureau ci-dessous." />
          </div>
        ) : (
          <div className="mb-4 flex flex-col gap-2">
            {wilaya.bureaus.map((bureau) => (
              <div key={bureau.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <span className={`flex-1 text-sm font-medium ${bureau.isActive ? "text-slate-800" : "text-slate-400 line-through"}`}>
                  {bureau.name}
                </span>
                <div className="w-24 shrink-0">
                  <Switch
                    checked={bureau.isActive}
                    onChange={(v) => updateBureau.mutate({ bureauId: bureau.id, isActive: v })}
                    label={bureau.isActive ? "Actif" : "Inactif"}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDelete({ id: bureau.id, name: bureau.name })}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Supprimer le bureau"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAdd} className="flex items-center gap-2 border-t border-slate-100 pt-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du bureau (ex: Agence Centre)"
            className="flex-1"
          />
          <Button type="submit" variant="primary" disabled={!name.trim() || createBureau.isPending}>
            <IconPlus className="h-4 w-4" /> Ajouter
          </Button>
        </form>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Supprimer ce bureau ?"
        description={pendingDelete ? `"${pendingDelete.name}" sera retire. Les commandes passees gardent une trace du bureau.` : undefined}
        confirmLabel="Supprimer"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteBureau.mutate(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
