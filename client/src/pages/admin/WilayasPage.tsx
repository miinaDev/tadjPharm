import { useMemo, useState } from "react";
import { useAdminWilayas, useUpdateWilaya } from "../../hooks/useAdminWilayas";
import { WilayaTariffTable } from "../../components/admin/WilayaTariffTable";
import { Spinner } from "../../components/common/Spinner";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Field";
import { IconSearch } from "../../components/ui/icons";

export function WilayasPage() {
  const { data: wilayas, isLoading } = useAdminWilayas();
  const updateWilaya = useUpdateWilaya();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const all = wilayas ?? [];
    if (!search.trim()) return all;
    const q = search.trim().toLowerCase();
    return all.filter((w) => w.name.toLowerCase().includes(q) || String(w.id) === q);
  }, [wilayas, search]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Tarifs de livraison" description="Prix de livraison par wilaya, applique automatiquement dans le formulaire de commande" />

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
          <WilayaTariffTable wilayas={filtered} onUpdate={(id, payload) => updateWilaya.mutate({ id, ...payload })} />
        )}
      </Card>
    </div>
  );
}
