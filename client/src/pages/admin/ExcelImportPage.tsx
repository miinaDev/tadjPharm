import { ExcelImportForm } from "../../components/admin/ExcelImportForm";
import { PageHeader } from "../../components/ui/PageHeader";

export function ExcelImportPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Import de produits" description="Creez plusieurs produits en une fois depuis un fichier Excel" />
      <ExcelImportForm />
    </div>
  );
}
