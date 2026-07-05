import type { Request, Response } from "express";
import * as categoryService from "../services/category.service";
import {
  createCategorySchema,
  createSubcategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
  updateSubcategorySchema,
} from "../validators/category.validator";
import { HttpError } from "../middleware/errorHandler";

export async function listCategories(_req: Request, res: Response) {
  const categories = await categoryService.listAdminCategories();
  res.json(categories);
}

export async function createCategory(req: Request, res: Response) {
  const input = createCategorySchema.parse(req.body);
  const category = await categoryService.createCategory(input);
  res.status(201).json(category);
}

export async function updateCategory(req: Request, res: Response) {
  const input = updateCategorySchema.parse(req.body);
  const category = await categoryService.updateCategory(req.params.id, input);
  res.json(category);
}

export async function deleteCategory(req: Request, res: Response) {
  const { password } = deleteCategorySchema.parse(req.body);
  if (!req.adminId) throw new HttpError(401, "Authentification requise");
  const result = await categoryService.deleteCategory(req.params.id, req.adminId, password);
  res.json(result);
}

export async function createSubcategory(req: Request, res: Response) {
  const input = createSubcategorySchema.parse(req.body);
  const subcategory = await categoryService.createSubcategory(req.params.id, input);
  res.status(201).json(subcategory);
}

export async function updateSubcategory(req: Request, res: Response) {
  const input = updateSubcategorySchema.parse(req.body);
  const subcategory = await categoryService.updateSubcategory(req.params.subId, input);
  res.json(subcategory);
}

export async function deleteSubcategory(req: Request, res: Response) {
  await categoryService.deleteSubcategory(req.params.subId);
  res.status(204).send();
}
