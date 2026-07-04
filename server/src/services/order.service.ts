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
    // Produit sans suivi de stock : toujours disponible, on ne verifie pas la quantite.
    if (variant.product.trackStock && variant.stockQuantity < item.quantity) {
      throw new HttpError(409, `Stock insuffisant pour ${variant.product.name}`);
    }
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

  const order = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      // Produit sans suivi de stock : rien a decrementer (disponibilite illimitee).
      if (!variantById.get(item.variantId)!.product.trackStock) continue;
      const updated = await tx.productVariant.updateMany({
        where: { id: item.variantId, stockQuantity: { gte: item.quantity } },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new HttpError(409, "Stock insuffisant pour un des articles de la commande");
      }
    }

    return tx.order.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        wilayaId: input.wilayaId,
        wilayaNameSnapshot: wilaya.name,
        shippingMethod: input.shippingMethod,
        address,
        bureauId,
        bureauNameSnapshot,
        deliveryFeeSnapshot: deliveryFeeNum,
        totalSnapshot: totalNum,
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
          { firstName: { contains: params.search, mode: "insensitive" as const } },
          { lastName: { contains: params.search, mode: "insensitive" as const } },
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
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
  if (!order) throw new HttpError(404, "Commande introuvable");

  const isCancelling = status === "ANNULEE" && order.status !== "ANNULEE";
  const isUncancelling = order.status === "ANNULEE" && status !== "ANNULEE";

  // On ne touche au stock que pour les produits qui en assurent le suivi.
  const affectsStock = (item: (typeof order.items)[number]) =>
    Boolean(item.variantId && item.variant && item.variant.product.trackStock);

  const updated = await prisma.$transaction(async (tx) => {
    if (isCancelling) {
      for (const item of order.items) {
        // La variante a pu etre supprimee depuis (variantId null) : plus de stock a restaurer.
        if (!affectsStock(item)) continue;
        await tx.productVariant.update({
          where: { id: item.variantId! },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    } else if (isUncancelling) {
      for (const item of order.items) {
        if (!affectsStock(item)) continue;
        await tx.productVariant.update({
          where: { id: item.variantId! },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }
    }
    return tx.order.update({ where: { id }, data: { status }, include: ORDER_INCLUDE });
  });

  return serializeOrder(updated);
}
