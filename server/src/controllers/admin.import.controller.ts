import type { Request, Response } from "express";
import { HttpError } from "../middleware/errorHandler";
import * as importService from "../services/import.service";

export async function importProducts(req: Request, res: Response) {
  const file = req.file;
  if (!file) throw new HttpError(400, "Aucun fichier envoye");
  const summary = await importService.importProductsFromExcel(file.buffer);
  res.json(summary);
}

export async function downloadTemplate(_req: Request, res: Response) {
  const buffer = await importService.buildImportTemplate();
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=modele-import-produits.xlsx");
  res.send(Buffer.from(buffer));
}
