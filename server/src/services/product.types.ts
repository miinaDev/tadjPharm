import type { z } from "zod";
import type {
  createProductSchema,
  createVariantSchema,
  updateColorSchema,
  updateProductSchema,
  updateVariantSchema,
} from "../validators/product.validator";

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type UpdateColorInput = z.infer<typeof updateColorSchema>;
