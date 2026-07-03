import type { Request, Response } from "express";
import * as productService from "../services/product.service";
import {
  addOptionSchema,
  createProductSchema,
  createVariantSchema,
  updateProductSchema,
  updateVariantSchema,
} from "../validators/product.validator";
import { HttpError } from "../middleware/errorHandler";

export async function listProducts(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const result = await productService.listAdminProducts({ page, pageSize });
  res.json(result);
}

export async function getProduct(req: Request, res: Response) {
  const product = await productService.getAdminProductById(req.params.id);
  res.json(product);
}

export async function createProduct(req: Request, res: Response) {
  const input = createProductSchema.parse(req.body);
  const product = await productService.createProduct(input);
  res.status(201).json(product);
}

export async function updateProduct(req: Request, res: Response) {
  const input = updateProductSchema.parse(req.body);
  const product = await productService.updateProduct(req.params.id, input);
  res.json(product);
}

export async function deleteProduct(req: Request, res: Response) {
  const result = await productService.deleteProduct(req.params.id);
  res.json(result);
}

export async function addOption(req: Request, res: Response) {
  const input = addOptionSchema.parse(req.body);
  const product = await productService.addOption(req.params.id, input.type, input.label, input.hexCode);
  res.status(201).json(product);
}

export async function removeOption(req: Request, res: Response) {
  const type = req.params.type as "color" | "size" | "volume";
  if (!["color", "size", "volume"].includes(type)) {
    throw new HttpError(400, "Type d'option invalide");
  }
  const product = await productService.removeOption(req.params.id, type, req.params.optionId);
  res.json(product);
}

export async function createVariant(req: Request, res: Response) {
  const input = createVariantSchema.parse(req.body);
  const variant = await productService.createVariant(req.params.id, input);
  res.status(201).json(variant);
}

export async function updateVariant(req: Request, res: Response) {
  const input = updateVariantSchema.parse(req.body);
  const variant = await productService.updateVariant(req.params.variantId, input);
  res.json(variant);
}

export async function deleteVariant(req: Request, res: Response) {
  await productService.deleteVariant(req.params.variantId);
  res.status(204).send();
}

export async function addImages(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new HttpError(400, "Aucun fichier envoye");
  const images = await productService.addImages(req.params.id, files);
  res.status(201).json(images);
}

export async function deleteImage(req: Request, res: Response) {
  await productService.deleteImage(req.params.imageId);
  res.status(204).send();
}
