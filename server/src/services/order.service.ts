import { prisma } from "../prisma";
import { HttpError } from "../middleware/errorHandler";
import { toNumber } from "../utils/decimal";
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
    wilaya: order.wilaya ? { ...order.wilaya, deliveryPrice: toNumber(order.wilaya.deliveryPrice) } : undefined,
  };
}

const ORDER_INCLUDE = {
  items: { include: { variant: { include: { product: true, color: true, size: true, volume: true } } } },
  wilaya: true,
};

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

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((i) => i.variantId) } },
    include: { product: true },
  });
  const variantById = new Map(variants.map((v) => [v.id, v]));

  for (const item of items) {
    const variant = variantById.get(item.variantId);
    if (!variant || !variant.product.isActive) {
      throw new HttpError(404, "Un des produits de la commande est introuvable");
    }
    if (variant.stockQuantity < item.quantity) {
      throw new HttpError(409, `Stock insuffisant pour ${variant.product.name}`);
    }
  }

  const deliveryFeeNum = toNumber(wilaya.deliveryPrice) ?? 0;
  const itemsWithPrice = items.map((item) => {
    const variant = variantById.get(item.variantId)!;
    const unitPrice = variant.priceOverride ?? variant.product.basePrice;
    const unitPriceNum = toNumber(unitPrice) ?? 0;
    return { ...item, unitPriceNum };
  });
  const totalNum = itemsWithPrice.reduce((sum, i) => sum + i.unitPriceNum * i.quantity, 0) + deliveryFeeNum;

  const order = await prisma.$transaction(async (tx) => {
    for (const item of items) {
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
        deliveryFeeSnapshot: deliveryFeeNum,
        totalSnapshot: totalNum,
        items: {
          create: itemsWithPrice.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPriceSnapshot: item.unitPriceNum,
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
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) throw new HttpError(404, "Commande introuvable");

  const isCancelling = status === "ANNULEE" && order.status !== "ANNULEE";
  const isUncancelling = order.status === "ANNULEE" && status !== "ANNULEE";

  const updated = await prisma.$transaction(async (tx) => {
    if (isCancelling) {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    } else if (isUncancelling) {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }
    }
    return tx.order.update({ where: { id }, data: { status }, include: ORDER_INCLUDE });
  });

  return serializeOrder(updated);
}
