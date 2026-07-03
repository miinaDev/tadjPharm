import { z } from "zod";

export const updateWilayaSchema = z.object({
  deliveryPrice: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});
