import { z } from "zod";

export const createWilayaSchema = z
  .object({
    id: z.number().int().min(1).max(58).optional(),
    name: z.string().trim().min(2).max(60).optional(),
  })
  .refine((d) => d.id != null || !!d.name, {
    message: "Fournir un code de wilaya officiel ou un nom personnalise",
  });

export const updateWilayaSchema = z.object({
  homePrice: z.number().min(0).optional(),
  officePrice: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const createBureauSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const updateBureauSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  isActive: z.boolean().optional(),
});
