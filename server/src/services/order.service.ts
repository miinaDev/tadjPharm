import { prisma } from "../prisma";
import { HttpError } from "../middleware/errorHandler";
import { toNumber } from "../utils/decimal";
import { applyDiscount } from "../utils/pricing";
import type { CreateOrderInput } from "../validators/order.validator";
import type { OrderStatus } from "@prisma/client";

function serializeOrder(order: any) {
  return {
    ...order,
    deliveryFeeSnapshot: toNumber(order.deliveryFeeSnapshot),
    totalSnapshot: toNumber(order.totalSnapshot),
    items: order.items?.map((item: any) => ({
      ...item,
      unitPriceSnapshot: toNumber(item.unitPriceSnapshot),
      variant: item.variant
        ? {
            ...item.variant,
            priceOverride: toNumber(item.variant.priceOverride),
            product: item.variant.product
              ? { ...item.variant.product, basePrice: toNumber(item.variant.product.basePrice) }
              : undefined,
          }
        : undefined,
    })),
    wilaya: order.wilaya
      ? { ...order.wilaya, homePrice: toNumber(order.wilaya.homePrice), officePrice: toNumber(order.wilaya.officePrice) }
      : undefined,
  };
}

const ORDER_INCLUDE = {
  items: { include: { variant: { include: { product: true, color: true, size: true, volume: true } } } },
  wilaya: true,
  bureau: true,
};

export function buildVariantLabel(variant: {
  color?: { label: string } | null;
  size?: { label: string } | null;
  volume?: { label: string } | null;
}) {
  const parts = [variant.color?.label, variant.size?.label, variant.volume?.label].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Standard";
}

function mergeDuplicateItems(items: CreateOrderInput["items"]) {
  const byVariant = new Map<string, number>();
  for (const item of items) {
    byVariant.set(item.variantId, (byVariant.get(item.variantId) ?? 0) + item.quantity);
  }
  return Array.from(byVariant.entries()).map(([variantId, quantity]) => ({ variantId, quantity }));
}

export async function createOrder(input: CreateOrderInput) {
  const items = mergeDuplicateItems(input.items);

  const wilaya = await prisma.wilaya.findUnique({ where: { id: input.wilayaId } });
  if (!wilaya || !wilaya.isActive) {
    throw new HttpError(400, "Wilaya invalide");
  }

  // Mode d'expedition : determine le prix de livraison et le bureau eventuel.
  let deliveryFeeNum = 0;
  let bureauId: string | null = null;
  let bureauNameSnapshot: string | null = null;
  let address = "";

  if (input.shippingMethod === "OFFICE") {
    if (!input.bureauId) throw new HttpError(400, "Veuillez choisir un bureau de livraison");
    const bureau = await prisma.deliveryBureau.findUnique({ where: { id: input.bureauId } });
    if (!bureau || bureau.wilayaId !== wilaya.id || !bureau.isActive) {
      throw new HttpError(400, "Bureau de livraison invalide pour cette wilaya");
    }
    deliveryFeeNum = toNumber(wilaya.officePrice) ?? 0;
    bureauId = bureau.id;
    bureauNameSnapshot = bureau.name;
  } else {
    if (!input.address || !input.address.trim()) {
      throw new HttpError(400, "L'adresse est obligatoire pour une livraison a domicile");
    }
    deliveryFeeNum = toNumber(wilaya.homePrice) ?? 0;
    address = input.address.trim();
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((i) => i.variantId) } },
    include: { product: true, color: true, size: true, volume: true },
  });
  const variantById = new Map(variants.map((v) => [v.id, v]));

  for (const item of items) {
    const variant = variantById.get(item.variantId);
    if (!variant || !variant.product.isActive) {
      throw new HttpError(404, "Un des produits de la commande est introuvable");
    }
    // Plus de gestion de stock : un produit est commandable uniquement s'il est disponible.
    if (!variant.product.isAvailable) {
      throw new HttpError(409, `Produit non disponible : ${variant.product.name}`);
    }
    // La combinaison choisie (couleur/taille/volume) doit etre active.
    if (!variant.isActive) {
      throw new HttpError(409, `Cette variante n'est plus disponible : ${variant.product.name}`);
    }
  }

  // Livraison speciale : si au moins un produit n'est pas livrable normalement, on ne calcule
  // pas le tarif de livraison (le client est prevenu, l'admin le fixera ensuite). Determine
  // cote serveur d'apres le produit reel, pas d'apres le client.
  const specialDelivery = items.some((item) => !variantById.get(item.variantId)!.product.isDeliverable);
  if (specialDelivery) {
    deliveryFeeNum = 0;
  }

  const itemsWithPrice = items.map((item) => {
    const variant = variantById.get(item.variantId)!;
    const unitPrice = variant.priceOverride ?? variant.product.basePrice;
    // Applique la remise produit : le client est facture le prix reduit.
    const unitPriceNum = applyDiscount(toNumber(unitPrice) ?? 0, variant.product.discountPercent);
    return {
      ...item,
      unitPriceNum,
      productNameSnapshot: variant.product.name,
      variantLabelSnapshot: buildVariantLabel(variant),
    };
  });
  const totalNum = itemsWithPrice.reduce((sum, i) => sum + i.unitPriceNum * i.quantity, 0) + deliveryFeeNum;

  // Plus aucun stock a decrementer : on cree simplement la commande.
  const order = await prisma.order.create({
    data: {
      fullName: input.fullName,
      phone: input.phone,
      wilayaId: input.wilayaId,
      wilayaNameSnapshot: wilaya.name,
      shippingMethod: input.shippingMethod,
      address,
      bureauId,
      bureauNameSnapshot,
      deliveryFeeSnapshot: deliveryFeeNum,
      totalSnapshot: totalNum,
      specialDelivery,
      items: {
        create: itemsWithPrice.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPriceSnapshot: item.unitPriceNum,
          productNameSnapshot: item.productNameSnapshot,
          variantLabelSnapshot: item.variantLabelSnapshot,
        })),
      },
    },
    include: ORDER_INCLUDE,
  });

  return serializeOrder(order);
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
  if (!order) throw new HttpError(404, "Commande introuvable");
  return serializeOrder(order);
}

export async function getRecentOrders(limit: number) {
  const orders = await prisma.order.findMany({
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return orders.map(serializeOrder);
}

export async function listAdminOrders(params: {
  status?: OrderStatus;
  wilayaId?: number;
  search?: string;
  page: number;
  pageSize: number;
}) {
  const where = {
    status: params.status,
    wilayaId: params.wilayaId,
    OR: params.search
      ? [
          { fullName: { contains: params.search, mode: "insensitive" as const } },
          { phone: { contains: params.search, mode: "insensitive" as const } },
        ]
      : undefined,
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders: orders.map(serializeOrder), total };
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new HttpError(404, "Commande introuvable");

  // Plus de gestion de stock : changer le statut (y compris annuler/reactiver) n'a
  // aucun effet sur un quelconque stock, on met juste a jour le statut.
  const updated = await prisma.order.update({ where: { id }, data: { status }, include: ORDER_INCLUDE });
  return serializeOrder(updated);
}

export async function updateOrderNote(id: string, note: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new HttpError(404, "Commande introuvable");

  const updated = await prisma.order.update({ where: { id }, data: { adminNote: note }, include: ORDER_INCLUDE });
  return serializeOrder(updated);
}

// L'admin fixe (ou corrige) le tarif de livraison d'une commande — notamment pour les
// commandes a livraison speciale, ou il est laisse en attente a la creation. Le total est
// recalcule a partir du sous-total fige des articles + le nouveau tarif.
export async function updateOrderDeliveryFee(id: string, deliveryFee: number) {
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) throw new HttpError(404, "Commande introuvable");

  const subtotal = order.items.reduce((sum, item) => sum + (toNumber(item.unitPriceSnapshot) ?? 0) * item.quantity, 0);
  const total = subtotal + deliveryFee;

  const updated = await prisma.order.update({
    where: { id },
    data: { deliveryFeeSnapshot: deliveryFee, totalSnapshot: total },
    include: ORDER_INCLUDE,
  });
  return serializeOrder(updated);
}
