import { useState } from "react";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../hooks/useAdminCategories";
import { SubcategoryManagerModal } from "../../components/admin/SubcategoryManagerModal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PasswordConfirmDialog } from "../../components/common/PasswordConfirmDialog";
import { Spinner } from "../../components/common/Spinner";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { Badge } from "../../components/ui/Badge";
import { IconCheck, IconPencil, IconPlus, IconTrash } from "../../components/ui/icons";
import { ApiError } from "../../api/client";
import type { AdminCategory } from "../../types";

const AUTRE_SLUG = "autre";

export function CategoriesPage() {
  const { data: categories, isLoading } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [managingId, setManagingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminCategory | null>(null); // etape 1
  const [passwordTarget, setPasswordTarget] = useState<AdminCategory | null>(null); // etape 2
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const managingCategory = categories?.find((c) => c.id === managingId) ?? null;

  function handleAdd() {
    const name = addName.trim();
    if (!name) return;
    setAddError(null);
    createCategory.mutate(name, {
      onSuccess: () => {
        setAddOpen(false);
        setAddName("");
      },
      onError: (err) => setAddError(err instanceof ApiError ? err.message : "Ajout impossible."),
    });
  }

  function saveEdit(id: string) {
    const name = editName.trim();
    if (!name) return;
    setActionError(null);
    updateCategory.mutate(
      { id, name },
      {
        onSuccess: () => setEditingId(null),
        onError: (err) => setActionError(err instanceof ApiError ? err.message : "Modification impossible."),
      }
    );
  }

  function handleConfirmDelete(password: string) {
    if (!passwordTarget) return;
    setDeleteError(null);
    deleteCategory.mutate(
      { id: passwordTarget.id, password },
      {
        onSuccess: () => setPasswordTarget(null),
        onError: (err) => setDeleteError(err instanceof ApiError ? err.message : "Suppression impossible."),
      }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Categories & sous-categories"
        description="Organisez votre catalogue. Les sous-categories (facultatives) aident vos clients a trouver leurs produits."
        action={
          <Button
            variant="primary"
            onClick={() => {
              setAddName("");
              setAddError(null);
              setAddOpen(true);
            }}
          >
            <IconPlus className="h-4 w-4" /> Ajouter une categorie
          </Button>
        }
      />

      {actionError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{actionError}</p>}

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Categorie</th>
                  <th className="px-4 py-3 font-medium">Produits</th>
                  <th className="px-4 py-3 font-medium">Sous-categories</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(categories ?? []).map((category) => {
                  const isAutre = category.slug === AUTRE_SLUG;
                  return (
                    <tr key={category.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        {editingId === category.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(category.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              className="max-w-[220px]"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => saveEdit(category.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 hover:bg-green-50"
                              aria-label="Valider"
                            >
                              <IconCheck className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{category.name}</span>
                            {isAutre && <Badge tone="slate">Repli</Badge>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="slate">
                          {category.productCount} produit{category.productCount > 1 ? "s" : ""}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setManagingId(category.id)}>
                          {category.subcategories.length > 0
                            ? `${category.subcategories.length} sous-categorie${category.subcategories.length > 1 ? "s" : ""}`
                            : "Ajouter"}
                        </Button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(category.id);
                              setEditName(category.name);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-brand-700"
                            aria-label="Renommer"
                          >
                            <IconPencil className="h-4 w-4" />
                          </button>
                          {!isAutre && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError(null);
                                setConfirmTarget(category);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                              aria-label="Supprimer"
                            >
                              <IconTrash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Ajout d'une categorie */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setAddOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-slate-900">Ajouter une categorie</h3>
            <div className="mt-4">
              <Input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Nom de la categorie"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
                autoFocus
              />
            </div>
            {addError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{addError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>
                Annuler
              </Button>
              <Button type="button" variant="primary" onClick={handleAdd} disabled={!addName.trim() || createCategory.isPending}>
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      )}

      {managingCategory && <SubcategoryManagerModal category={managingCategory} onClose={() => setManagingId(null)} />}

      {/* Suppression — etape 1 : confirmation */}
      <ConfirmDialog
        open={confirmTarget !== null}
        title={confirmTarget ? `Supprimer « ${confirmTarget.name} » ?` : "Supprimer ?"}
        description={
          confirmTarget
            ? `${confirmTarget.productCount} produit(s) seront deplaces vers « Autre »` +
              (confirmTarget.subcategories.length > 0
                ? ` et ses ${confirmTarget.subcategories.length} sous-categorie(s) seront supprimees.`
                : ".") +
              " Une confirmation par mot de passe sera demandee."
            : undefined
        }
        confirmLabel="Continuer"
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => {
          setPasswordTarget(confirmTarget);
          setConfirmTarget(null);
        }}
      />

      {/* Suppression — etape 2 : mot de passe admin */}
      <PasswordConfirmDialog
        open={passwordTarget !== null}
        title="Confirmez la suppression"
        description={
          passwordTarget
            ? `Saisissez votre mot de passe admin pour supprimer « ${passwordTarget.name} » et deplacer ses produits vers « Autre ».`
            : undefined
        }
        confirmLabel="Supprimer definitivement"
        error={deleteError}
        loading={deleteCategory.isPending}
        onCancel={() => setPasswordTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
