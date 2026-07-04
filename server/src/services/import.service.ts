import ExcelJS from "exceljs";
import { prisma } from "../prisma";
import { slugify, uniqueSlugSuffix } from "../utils/slugify";
import { guessColorHex } from "../utils/colors";

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

// Une ligne = une combinaison (variante). couleur/taille/volume au singulier.
const EXPECTED_COLUMNS = ["nom", "categorie", "description", "prix", "couleur", "taille", "volume", "stock"] as const;

interface RawRow {
  rowNumber: number;
  nom: string;
  categorie: string;
  description: string;
  prix: string;
  couleur: string;
  taille: string;
  volume: string;
  stock: string;
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in (value as any)) return String((value as any).text).trim();
  return String(value).trim();
}

/** Dedoublonne des libelles en ignorant la casse, en gardant la 1ere occurrence. */
function distinctLabels(labels: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const label of labels) {
    const key = label.toLowerCase();
    if (label && !seen.has(key)) {
      seen.add(key);
      out.push(label);
    }
  }
  return out;
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

  // 1) Lecture de toutes les lignes de donnees.
  const rawRows: RawRow[] = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    if (row.actualCellCount === 0) continue;
    const get = (col: string) => {
      const idx = columnIndexByName.get(col);
      return idx ? cellToString(row.getCell(idx).value) : "";
    };
    rawRows.push({
      rowNumber,
      nom: get("nom"),
      categorie: get("categorie"),
      description: get("description"),
      prix: get("prix"),
      couleur: get("couleur"),
      taille: get("taille"),
      volume: get("volume"),
      stock: get("stock"),
    });
  }
  summary.totalRows = rawRows.length;

  // 2) Regroupement par nom (ordre d'apparition). Lignes sans nom = erreurs isolees.
  const groups = new Map<string, RawRow[]>();
  const orderedKeys: string[] = [];
  for (const raw of rawRows) {
    const key = raw.nom.trim().toLowerCase();
    if (!key) {
      summary.failed += 1;
      summary.errors.push({ row: raw.rowNumber, message: "Colonne 'nom' vide" });
      continue;
    }
    if (!groups.has(key)) {
      groups.set(key, []);
      orderedKeys.push(key);
    }
    groups.get(key)!.push(raw);
  }

  // 3) Un produit par groupe, une variante par ligne.
  for (const key of orderedKeys) {
    const rows = groups.get(key)!;
    const first = rows[0];
    try {
      const nom = first.nom.trim();
      const categorieNom = first.categorie.trim();
      const description = first.description.trim();
      const prix = Number(first.prix);

      // La description est optionnelle (comme dans le formulaire produit).
      if (!first.prix || Number.isNaN(prix) || prix <= 0) throw new Error("Colonne 'prix' invalide");
      // Categorie vide ou "Autre" => categorie de repli "Autre".
      const lookupName = categorieNom === "" ? "autre" : categorieNom.toLowerCase();
      const category = categoryByName.get(lookupName);
      if (!category) {
        throw new Error(categorieNom ? `Categorie inconnue: '${categorieNom}'` : "Categorie 'Autre' introuvable");
      }

      const hasColors = rows.some((r) => r.couleur.trim() !== "");
      const hasSizes = rows.some((r) => r.taille.trim() !== "");
      const hasVolumes = rows.some((r) => r.volume.trim() !== "");
      const hasAnyOption = hasColors || hasSizes || hasVolumes;

      if (!hasAnyOption && rows.length > 1) {
        throw new Error("Produit sans option : une seule ligne autorisee (sinon renseignez couleur/taille/volume)");
      }

      // Validation par ligne + specs de variantes.
      const seenCombo = new Set<string>();
      const variantSpecs = rows.map((r) => {
        const couleur = r.couleur.trim();
        const taille = r.taille.trim();
        const volume = r.volume.trim();
        if (hasColors && !couleur) throw new Error(`Ligne ${r.rowNumber} : couleur manquante`);
        if (hasSizes && !taille) throw new Error(`Ligne ${r.rowNumber} : taille manquante`);
        if (hasVolumes && !volume) throw new Error(`Ligne ${r.rowNumber} : volume manquant`);

        const stock = r.stock ? Number(r.stock) : 0;
        if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
          throw new Error(`Ligne ${r.rowNumber} : stock invalide`);
        }

        const comboKey = `${couleur.toLowerCase()}|${taille.toLowerCase()}|${volume.toLowerCase()}`;
        if (seenCombo.has(comboKey)) throw new Error(`Ligne ${r.rowNumber} : combinaison en double`);
        seenCombo.add(comboKey);

        return { couleur, taille, volume, stock };
      });

      const colorLabels = distinctLabels(variantSpecs.map((v) => v.couleur));
      const sizeLabels = distinctLabels(variantSpecs.map((v) => v.taille));
      const volumeLabels = distinctLabels(variantSpecs.map((v) => v.volume));

      let slug = slugify(nom);
      // eslint-disable-next-line no-await-in-loop
      const existingSlug = await prisma.product.findUnique({ where: { slug } });
      if (existingSlug) slug = `${slug}-${uniqueSlugSuffix()}`;

      // eslint-disable-next-line no-await-in-loop
      await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: { name: nom, slug, description, basePrice: prix, categoryId: category.id, hasColors, hasSizes, hasVolumes },
        });

        const colorMap = new Map<string, string>();
        for (const label of colorLabels) {
          const created = await tx.productColor.create({
            data: { productId: product.id, label, hexCode: guessColorHex(label) },
          });
          colorMap.set(label.toLowerCase(), created.id);
        }
        const sizeMap = new Map<string, string>();
        for (const label of sizeLabels) {
          const created = await tx.productSize.create({ data: { productId: product.id, label } });
          sizeMap.set(label.toLowerCase(), created.id);
        }
        const volumeMap = new Map<string, string>();
        for (const label of volumeLabels) {
          const created = await tx.productVolume.create({ data: { productId: product.id, label } });
          volumeMap.set(label.toLowerCase(), created.id);
        }

        for (const spec of variantSpecs) {
          await tx.productVariant.create({
            data: {
              productId: product.id,
              colorId: spec.couleur ? colorMap.get(spec.couleur.toLowerCase()) ?? null : null,
              sizeId: spec.taille ? sizeMap.get(spec.taille.toLowerCase()) ?? null : null,
              volumeId: spec.volume ? volumeMap.get(spec.volume.toLowerCase()) ?? null : null,
              stockQuantity: spec.stock,
            },
          });
        }
      });

      summary.created += 1;
    } catch (err) {
      summary.failed += 1;
      summary.errors.push({ row: first.rowNumber, message: err instanceof Error ? err.message : "Erreur inconnue" });
    }
  }

  return summary;
}

export async function buildImportTemplate(): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Produits");
  sheet.columns = EXPECTED_COLUMNS.map((keyName) => ({ header: keyName, key: keyName, width: 20 }));
  sheet.getRow(1).font = { bold: true };

  // Exemple 1 : produit a variantes (3 combinaisons, meme nom).
  sheet.addRow({ nom: "Exemple - T-shirt", categorie: "Appareillage", description: "T-shirt medical", prix: 2500, couleur: "Rouge", taille: "M", volume: "", stock: 10 });
  sheet.addRow({ nom: "Exemple - T-shirt", categorie: "Appareillage", description: "T-shirt medical", prix: 2500, couleur: "Rouge", taille: "L", volume: "", stock: 5 });
  sheet.addRow({ nom: "Exemple - T-shirt", categorie: "Appareillage", description: "T-shirt medical", prix: 2500, couleur: "Bleu", taille: "M", volume: "", stock: 8 });
  // Exemple 2 : produit simple (une seule ligne, options vides).
  sheet.addRow({ nom: "Exemple - Sirop", categorie: "Consommables", description: "Sirop 200ml", prix: 800, couleur: "", taille: "", volume: "", stock: 20 });

  const info = workbook.addWorksheet("Instructions");
  info.columns = [{ header: "Comment remplir le fichier", key: "t", width: 95 }];
  info.getRow(1).font = { bold: true };
  const lines = [
    "Une ligne = une combinaison (couleur / taille / volume) avec son propre stock.",
    "Produit a plusieurs variantes : repetez le meme 'nom' sur chaque ligne, une ligne par combinaison.",
    "Les infos produit (categorie, description, prix) sont lues sur la 1ere ligne du produit.",
    "Produit SANS option : une seule ligne, laissez couleur/taille/volume vides.",
    "Si une option est utilisee, renseignez-la sur TOUTES les lignes du produit.",
    "La categorie doit deja exister dans le catalogue. Vide ou 'Autre' => categorie Autre.",
    "L'import cree toujours de NOUVEAUX produits.",
  ];
  lines.forEach((t) => info.addRow({ t }));

  return workbook.xlsx.writeBuffer();
}
