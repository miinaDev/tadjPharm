import type { Request, Response } from "express";
import * as wilayaService from "../services/wilaya.service";
import {
  createWilayaSchema,
  updateWilayaSchema,
  createBureauSchema,
  updateBureauSchema,
} from "../validators/wilaya.validator";

export async function listWilayas(_req: Request, res: Response) {
  const wilayas = await wilayaService.listAdminWilayas();
  res.json(wilayas);
}

export async function getWilayaCatalog(_req: Request, res: Response) {
  const catalog = await wilayaService.listWilayaCatalog();
  res.json(catalog);
}

export async function createWilaya(req: Request, res: Response) {
  const input = createWilayaSchema.parse(req.body);
  const wilaya = await wilayaService.createWilaya(input);
  res.status(201).json(wilaya);
}

export async function updateWilaya(req: Request, res: Response) {
  const input = updateWilayaSchema.parse(req.body);
  const wilaya = await wilayaService.updateWilaya(Number(req.params.id), input);
  res.json(wilaya);
}

export async function deleteWilaya(req: Request, res: Response) {
  await wilayaService.deleteWilaya(Number(req.params.id));
  res.status(204).end();
}

export async function createBureau(req: Request, res: Response) {
  const input = createBureauSchema.parse(req.body);
  const bureau = await wilayaService.createBureau(Number(req.params.id), input);
  res.status(201).json(bureau);
}

export async function updateBureau(req: Request, res: Response) {
  const input = updateBureauSchema.parse(req.body);
  const bureau = await wilayaService.updateBureau(req.params.bureauId, input);
  res.json(bureau);
}

export async function deleteBureau(req: Request, res: Response) {
  await wilayaService.deleteBureau(req.params.bureauId);
  res.status(204).end();
}
