import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1),
  basePrice: z.number().positive(),
  categoryId: z.string().min(1),
  hasColors: z.boolean().default(false),
  hasSizes: z.boolean().default(false),
  hasVolumes: z.boolean().default(false),
  colors: z.array(z.object({ label: z.string().min(1), hexCode: z.string().optional() })).default([]),
  sizes: z.array(z.object({ label: z.string().min(1) })).default([]),
  volumes: z.array(z.object({ label: z.string().min(1) })).default([]),
  initialStock: z.number().int().min(0).default(0),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).optional(),
  basePrice: z.number().positive().optional(),
  categoryId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const addOptionSchema = z.object({
  type: z.enum(["color", "size", "volume"]),
  label: z.string().trim().min(1),
  hexCode: z.string().optional(),
});

export const createVariantSchema = z.object({
  colorId: z.string().nullable().optional(),
  sizeId: z.string().nullable().optional(),
  volumeId: z.string().nullable().optional(),
  stockQuantity: z.number().int().min(0).default(0),
  priceOverride: z.number().positive().nullable().optional(),
});

export const updateVariantSchema = z.object({
  stockQuantity: z.number().int().min(0).optional(),
  priceOverride: z.number().positive().nullable().optional(),
});
