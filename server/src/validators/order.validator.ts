import { z } from "zod";

const orderItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "La commande doit contenir au moins un article"),
  wilayaId: z.number().int().min(1).max(58),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6).max(30),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(["NOUVELLE", "CONFIRMEE", "EXPEDIEE", "ANNULEE"]),
});
