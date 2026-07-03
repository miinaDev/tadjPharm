import type { Request, Response } from "express";
import * as wilayaService from "../services/wilaya.service";
import { updateWilayaSchema } from "../validators/wilaya.validator";

export async function listWilayas(_req: Request, res: Response) {
  const wilayas = await wilayaService.listAdminWilayas();
  res.json(wilayas);
}

export async function updateWilaya(req: Request, res: Response) {
  const input = updateWilayaSchema.parse(req.body);
  const wilaya = await wilayaService.updateWilaya(Number(req.params.id), input);
  res.json(wilaya);
}
