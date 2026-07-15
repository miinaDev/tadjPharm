import { z } from "zod";

const orderItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
});

export const createOrderSchema = z
  .object({
    items: z.array(orderItemSchema).min(1, "La commande doit contenir au moins un article"),
    // Pas de plafond a 58 : les wilayas personnalisees ont un id >= 59.
    // Le service verifie de toute facon l'existence et l'activation de la wilaya.
    wilayaId: z.number().int().min(1),
    fullName: z.string().trim().min(1).max(200),
    phone: z.string().trim().min(6).max(30),
    shippingMethod: z.enum(["HOME", "OFFICE"]),
    address: z.string().trim().max(500).optional(),
    bureauId: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.shippingMethod === "HOME" && !data.address?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address"], message: "L'adresse est obligatoire pour une livraison a domicile" });
    }
    if (data.shippingMethod === "OFFICE" && !data.bureauId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bureauId"], message: "Veuillez choisir un bureau de livraison" });
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(["NOUVELLE", "CONFIRMEE", "EXPEDIEE", "LIVREE", "ANNULEE"]),
});

export const updateOrderNoteSchema = z.object({
  note: z.string().max(2000).default(""),
});

export const updateOrderDeliveryFeeSchema = z.object({
  deliveryFee: z.number().min(0).max(1_000_000),
});
