import ExcelJS from "exceljs";
import { prisma } from "../prisma";
import { slugify, uniqueSlugSuffix } from "../utils/slugify";

interface ImportRowError {
  row: number;
  message: string;
}

interface ImportSummary {
  totalRows: number;
  created: number;
  failed: number;
  errors: ImportRowError[];
}

const EXPECTED_COLUMNS = ["nom", "categorie", "description", "prix", "stock", "couleurs", "tailles", "volumes"] as const;

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in (value as any)) return String((value as any).text);
  return String(value).trim();
}

export async function importProductsFromExcel(buffer: Buffer): Promise<ImportSummary> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return { totalRows: 0, created: 0, failed: 0, errors: [{ row: 0, message: "Feuille Excel vide ou introuvable" }] };
  }

  const headerRow = worksheet.getRow(1);
  const columnIndexByName = new Map<string, number>();
  headerRow.eachCell((cell, colNumber) => {
    const header = cellToString(cell.value).toLowerCase();
    if ((EXPECTED_COLUMNS as readonly string[]).includes(header)) {
      columnIndexByName.set(header, colNumber);
    }
  });

  const categories = await prisma.category.findMany();
  const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));

  const summary: ImportSummary = { totalRows: 0, created: 0, failed: 0, errors: [] };

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    const isEmptyRow = row.actualCellCount === 0;
    if (isEmptyRow) continue;

    summary.totalRows += 1;

    try {
      const get = (col: string) => {
        const idx = columnIndexByName.get(col);
        return idx ? cellToString(row.getCell(idx).value) : "";
      };

      const nom = get("nom");
      const categorieNom = get("categorie");
      const description = get("description");
      const prixRaw = get("prix");
      const stockRaw = get("stock");
      const couleurs = splitList(get("couleurs"));
      const tailles = splitList(get("tailles"));
      const volumes = splitList(get("volumes"));

      if (!nom) throw new Error("Colonne 'nom' manquante ou vide");
      if (!categorieNom) throw new Error("Colonne 'categorie' manquante ou vide");
      if (!description) throw new Error("Colonne 'description' manquante ou vide");

      const prix = Number(prixRaw);
      if (!prixRaw || Number.isNaN(prix) || prix <= 0) throw new Error("Colonne 'prix' invalide");

      const category = categoryByName.get(categorieNom.toLowerCase());
      if (!category) throw new Error(`Categorie inconnue: '${categorieNom}'`);

      const stock = stockRaw ? Number(stockRaw) : 0;
      if (Number.isNaN(stock) || stock < 0) throw new Error("Colonne 'stock' invalide");

      let slug = slugify(nom);
      // eslint-disable-next-line no-await-in-loop
      const existingSlug = await prisma.product.findUnique({ where: { slug } });
      if (existingSlug) slug = `${slug}-${uniqueSlugSuffix()}`;

      const hasColors = couleurs.length > 0;
      const hasSizes = tailles.length > 0;
      const hasVolumes = volumes.length > 0;

      // eslint-disable-next-line no-await-in-loop
      await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name: nom,
            slug,
            description,
            basePrice: prix,
            categoryId: category.id,
            hasColors,
            hasSizes,
            hasVolumes,
          },
        });

        await Promise.all([
          ...couleurs.map((label) => tx.productColor.create({ data: { productId: product.id, label } })),
          ...tailles.map((label) => tx.productSize.create({ data: { productId: product.id, label } })),
          ...volumes.map((label) => tx.productVolume.create({ data: { productId: product.id, label } })),
        ]);

        await tx.productVariant.create({ data: { productId: product.id, stockQuantity: stock } });
      });

      summary.created += 1;
    } catch (err) {
      summary.failed += 1;
      summary.errors.push({ row: rowNumber, message: err instanceof Error ? err.message : "Erreur inconnue" });
    }
  }

  return summary;
}

export async function buildImportTemplate(): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Produits");
  sheet.columns = EXPECTED_COLUMNS.map((key) => ({ header: key, key, width: 22 }));
  sheet.addRow({
    nom: "Exemple - Cannes anglaises",
    categorie: "Appareillage",
    description: "Cannes anglaises reglables en aluminium",
    prix: 2500,
    stock: 10,
    couleurs: "Gris, Noir",
    tailles: "",
    volumes: "",
  });
  return workbook.xlsx.writeBuffer();
}
