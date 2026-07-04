import { useMemo, useState } from "react";
import {
  useAdminWilayas,
  useUpdateWilaya,
  useCreateWilaya,
  useDeleteWilaya,
  useWilayaCatalog,
} from "../../hooks/useAdminWilayas";
import { WilayaTariffTable } from "../../components/admin/WilayaTariffTable";
import { BureauManagerModal } from "../../components/admin/BureauManagerModal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Spinner } from "../../components/common/Spinner";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Field";
import { IconPlus, IconSearch } from "../../components/ui/icons";
import { ApiError } from "../../api/client";
import type { Wilaya } from "../../types";

export function WilayasPage() {
  const { data: wilayas, isLoading } = useAdminWilayas();
  const updateWilaya = useUpdateWilaya();
  const createWilaya = useCreateWilaya();
  const deleteWilaya = useDeleteWilaya();
  const { data: catalog } = useWilayaCatalog();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<"official" | "custom">("official");
  const [addId, setAddId] = useState("");
  const [addName, setAddName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [managingId, setManagingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Wilaya | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const all = wilayas ?? [];
    if (!search.trim()) return all;
    const q = search.trim().toLowerCase();
    return all.filter((w) => w.name.toLowerCase().includes(q) || String(w.id) === q);
  }, [wilayas, search]);

  const managingWilaya = wilayas?.find((w) => w.id === managingId) ?? null;

  function openAdd() {
    const hasCatalog = Boolean(catalog && catalog.length > 0);
    setAddMode(hasCatalog ? "official" : "custom");
    setAddId("");
    setAddName("");
    setAddError(null);
    setAddOpen(true);
  }

  function handleAdd() {
    const payload =
      addMode === "official"
        ? addId
          ? { id: Number(addId) }
          : null
        : addName.trim()
          ? { name: addName.trim() }
          : null;
    if (!payload) return;
    setAddError(null);
    createWilaya.mutate(payload, {
      onSuccess: () => {
        setAddOpen(false);
        setAddId("");
        setAddName("");
      },
      onError: (err) => setAddError(err instanceof ApiError ? err.message : "Ajout impossible."),
    });
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    setActionError(null);
    deleteWilaya.mutate(id, {
      onError: (err) => setActionError(err instanceof ApiError ? err.message : "Suppression impossible."),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Livraison — wilayas & bureaux"
        description="Prix a domicile et au bureau par wilaya, et gestion des bureaux de retrait"
        action={
          <Button variant="primary" onClick={openAdd}>
            <IconPlus className="h-4 w-4" /> Ajouter une wilaya
          </Button>
        }
      />

      {actionError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{actionError}</p>
      )}

      <Card>
        <div className="border-b border-slate-100 p-3">
          <div className="relative max-w-xs">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une wilaya..." className="pl-9" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <WilayaTariffTable
            wilayas={filtered}
            onUpdate={(id, payload) => updateWilaya.mutate({ id, ...payload })}
            onManageBureaus={(w) => setManagingId(w.id)}
            onDelete={(w) => setPendingDelete(w)}
          />
        )}
      </Card>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setAddOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-slate-900">Ajouter une wilaya</h3>

            <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-sm">
              <button
                type="button"
                onClick={() => setAddMode("official")}
                disabled={!catalog || catalog.length === 0}
                className={`rounded-lg px-3 py-1.5 font-medium transition ${
                  addMode === "official" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                Liste officielle
              </button>
              <button
                type="button"
                onClick={() => setAddMode("custom")}
                className={`rounded-lg px-3 py-1.5 font-medium transition ${
                  addMode === "custom" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                Personnalisee
              </button>
            </div>

            {addMode === "official" ? (
              <div className="mt-4">
                <p className="mb-2 text-sm text-slate-500">Choisissez une wilaya parmi celles non encore ajoutees.</p>
                <Select value={addId} onChange={(e) => setAddId(e.target.value)}>
                  <option value="">Selectionner une wilaya...</option>
                  {catalog?.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.id} - {w.name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <div className="mt-4">
                <p className="mb-2 text-sm text-slate-500">Saisissez le nom d'une zone de livraison personnalisee.</p>
                <Input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Nom de la wilaya / zone"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                  }}
                />
              </div>
            )}

            {addError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{addError}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>
                Annuler
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleAdd}
                disabled={createWilaya.isPending || (addMode === "official" ? !addId : !addName.trim())}
              >
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      )}

      {managingWilaya && <BureauManagerModal wilaya={managingWilaya} onClose={() => setManagingId(null)} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete ? `Supprimer ${pendingDelete.name} ?` : "Supprimer ?"}
        description="La wilaya et ses bureaux seront retires. Les commandes passees restent intactes (nom de la wilaya archive)."
        confirmLabel="Supprimer"
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
