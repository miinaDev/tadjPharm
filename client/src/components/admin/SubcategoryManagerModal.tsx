import { useState, type FormEvent } from "react";
import type { AdminCategory } from "../../types";
import { useCreateSubcategory, useUpdateSubcategory, useDeleteSubcategory } from "../../hooks/useAdminCategories";
import { Button } from "../ui/Button";
import { Input } from "../ui/Field";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { EmptyState } from "../common/EmptyState";
import { IconCheck, IconPencil, IconPlus, IconTrash } from "../ui/icons";
import { ApiError } from "../../api/client";

export function SubcategoryManagerModal({ category, onClose }: { category: AdminCategory; onClose: () => void }) {
  const createSub = useCreateSubcategory();
  const updateSub = useUpdateSubcategory();
  const deleteSub = useDeleteSubcategory();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string; productCount: number } | null>(null);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    createSub.mutate(
      { categoryId: category.id, name: trimmed },
      {
        onSuccess: () => setName(""),
        onError: (err) => setError(err instanceof ApiError ? err.message : "Ajout impossible."),
      }
    );
  }

  function saveEdit(id: string) {
    const trimmed = editName.trim();
    if (!trimmed) return;
    setError(null);
    updateSub.mutate(
      { subId: id, name: trimmed },
      {
        onSuccess: () => setEditingId(null),
        onError: (err) => setError(err instanceof ApiError ? err.message : "Modification impossible."),
      }
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Sous-categories</h2>
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
          Categorie : <span className="font-medium text-slate-700">{category.name}</span>
        </p>

        {category.subcategories.length === 0 ? (
          <div className="py-6">
            <EmptyState title="Aucune sous-categorie" description="Ajoutez-en une ci-dessous (facultatif)." />
          </div>
        ) : (
          <div className="mb-4 flex flex-col gap-2">
            {category.subcategories.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                {editingId === sub.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(sub.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(sub.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-green-600 hover:bg-green-50"
                      aria-label="Valider"
                    >
                      <IconCheck className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-800">{sub.name}</span>
                      <span className="ml-2 text-xs text-slate-400">
                        {sub.productCount} produit{sub.productCount > 1 ? "s" : ""}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(sub.id);
                        setEditName(sub.name);
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-brand-700"
                      aria-label="Renommer"
                    >
                      <IconPencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete({ id: sub.id, name: sub.name, productCount: sub.productCount })}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Supprimer la sous-categorie"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleAdd} className="flex items-center gap-2 border-t border-slate-100 pt-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de la sous-categorie (ex: Coussin)"
            className="flex-1"
          />
          <Button type="submit" variant="primary" disabled={!name.trim() || createSub.isPending}>
            <IconPlus className="h-4 w-4" /> Ajouter
          </Button>
        </form>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Supprimer cette sous-categorie ?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" sera retiree.${
                pendingDelete.productCount > 0
                  ? ` Ses ${pendingDelete.productCount} produit(s) resteront dans la categorie, sans sous-categorie.`
                  : ""
              }`
            : undefined
        }
        confirmLabel="Supprimer"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteSub.mutate(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
