import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export const createSubcategorySchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export const updateSubcategorySchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export const deleteCategorySchema = z.object({
  password: z.string().min(1, "Mot de passe requis"),
});
