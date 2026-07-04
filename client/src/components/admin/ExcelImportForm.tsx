import { useRef, useState, type DragEvent } from "react";
import { useImportExcel } from "../../hooks/useImportExcel";
import { adminImportApi, type ImportSummary } from "../../api/admin";
import { ApiError } from "../../api/client";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Spinner } from "../common/Spinner";
import { IconUpload } from "../ui/icons";

export function ExcelImportForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importExcel = useImportExcel();
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setSummary(null);
    try {
      const result = await importExcel.mutateAsync(file);
      setSummary(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Echec de l'import");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader
          title="Modele de fichier"
          description="Une ligne par combinaison. Colonnes : nom, categorie, description, prix, couleur, taille, volume, stock. Repetez le nom du produit sur chaque variante (une ligne par couleur/taille/volume avec son stock) ; laissez couleur/taille/volume vides pour un produit simple."
          action={
            <a href={adminImportApi.templateUrl()}>
              <Button type="button" variant="secondary">
                Telecharger le modele
              </Button>
            </a>
          }
        />
      </Card>

      <Card>
        <CardHeader title="Importer un fichier" />
        <CardBody>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              isDragging ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
            }`}
          >
            {importExcel.isPending ? (
              <>
                <Spinner />
                <p className="text-sm text-slate-500">Import en cours...</p>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                  <IconUpload className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-700">Glissez-deposez votre fichier .xlsx ici</p>
                <p className="text-xs text-slate-400">ou cliquez pour parcourir</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={importExcel.isPending}
            className="hidden"
          />
        </CardBody>
      </Card>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {summary && (
        <Card>
          <CardHeader
            title="Resultat de l'import"
            action={
              <div className="flex gap-2">
                <Badge tone="slate">{summary.totalRows} lignes</Badge>
                <Badge tone="green">{summary.created} produits</Badge>
                {summary.failed > 0 && <Badge tone="red">{summary.failed} echecs</Badge>}
              </div>
            }
          />
          {summary.errors.length > 0 && (
            <CardBody>
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400">
                  <tr>
                    <th className="py-1 pr-3">Ligne</th>
                    <th className="py-1">Erreur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.errors.map((e) => (
                    <tr key={e.row}>
                      <td className="py-1.5 pr-3 text-slate-500">{e.row}</td>
                      <td className="py-1.5 text-red-600">{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          )}
        </Card>
      )}
    </div>
  );
}
