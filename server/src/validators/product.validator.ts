import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().default(""),
  basePrice: z.number().positive(),
  discountPercent: z.number().int().min(0).max(100).default(0),
  ribbonLabel: z.string().trim().max(30).nullable().optional(),
  categoryId: z.string().min(1),
  subcategoryId: z.string().nullable().optional(),
  hasColors: z.boolean().default(false),
  hasSizes: z.boolean().default(false),
  hasVolumes: z.boolean().default(false),
  colors: z.array(z.object({ label: z.string().min(1), hexCode: z.string().optional() })).default([]),
  sizes: z.array(z.object({ label: z.string().min(1) })).default([]),
  volumes: z.array(z.object({ label: z.string().min(1) })).default([]),
  // Combinaisons couleur/taille/volume avec leur prix optionnel, saisies directement a la creation
  // (les labels referencent les valeurs des tableaux colors/sizes/volumes ci-dessus).
  variants: z
    .array(
      z.object({
        colorLabel: z.string().min(1).optional(),
        sizeLabel: z.string().min(1).optional(),
        volumeLabel: z.string().min(1).optional(),
        priceOverride: z.number().positive().nullable().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .default([]),
  isAvailable: z.boolean().default(true),
  isDeliverable: z.boolean().default(true),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().optional(),
  basePrice: z.number().positive().optional(),
  discountPercent: z.number().int().min(0).max(100).optional(),
  ribbonLabel: z.string().trim().max(30).nullable().optional(),
  categoryId: z.string().min(1).optional(),
  subcategoryId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isDeliverable: z.boolean().optional(),
});

export const addOptionSchema = z.object({
  type: z.enum(["color", "size", "volume"]),
  label: z.string().trim().min(1),
  hexCode: z.string().optional(),
});

export const updateColorSchema = z.object({
  hexCode: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide")
    .optional(),
  label: z.string().trim().min(1).optional(),
});

export const setImageColorSchema = z.object({
  colorId: z.string().min(1).nullable(),
});

export const createVariantSchema = z.object({
  colorId: z.string().nullable().optional(),
  sizeId: z.string().nullable().optional(),
  volumeId: z.string().nullable().optional(),
  priceOverride: z.number().positive().nullable().optional(),
});

export const updateVariantSchema = z.object({
  priceOverride: z.number().positive().nullable().optional(),
  isActive: z.boolean().optional(),
});
