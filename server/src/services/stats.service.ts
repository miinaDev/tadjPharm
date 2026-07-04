import { prisma } from "../prisma";
import { toNumber } from "../utils/decimal";
import { getRecentOrders, buildVariantLabel } from "./order.service";

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Le seuil "stock bas" est defini par produit (lowStockThreshold) et seuls les
  // produits avec suivi de stock (trackStock) sont comptes -> requetes SQL brutes.
  const [
    newOrders,
    monthOrders,
    prevMonthOrders,
    monthAgg,
    outOfStockRows,
    lowStockRows,
    recentOrders,
    lowStockIdRows,
  ] = await Promise.all([
    prisma.order.count({ where: { status: "NOUVELLE" } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfPrevMonth, lt: startOfMonth } } }),
    prisma.order.aggregate({
      _sum: { totalSnapshot: true },
      _avg: { totalSnapshot: true },
      where: { createdAt: { gte: startOfMonth }, status: { not: "ANNULEE" } },
    }),
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "ProductVariant" v
      JOIN "Product" p ON p.id = v."productId"
      WHERE p."isActive" = true AND p."trackStock" = true AND v."stockQuantity" = 0
    `,
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "ProductVariant" v
      JOIN "Product" p ON p.id = v."productId"
      WHERE p."isActive" = true AND p."trackStock" = true
        AND v."stockQuantity" >= 1 AND v."stockQuantity" <= p."lowStockThreshold"
    `,
    getRecentOrders(8),
    prisma.$queryRaw<{ id: string }[]>`
      SELECT v.id
      FROM "ProductVariant" v
      JOIN "Product" p ON p.id = v."productId"
      WHERE p."isActive" = true AND p."trackStock" = true
        AND v."stockQuantity" <= p."lowStockThreshold"
      ORDER BY v."stockQuantity" ASC
      LIMIT 12
    `,
  ]);

  const outOfStockCount = Number(outOfStockRows[0]?.count ?? 0);
  const lowStockCount = Number(lowStockRows[0]?.count ?? 0);

  // On recharge les variantes listees avec leurs libelles (couleur/taille/volume).
  const lowStockIds = lowStockIdRows.map((r) => r.id);
  const lowStockVariants = lowStockIds.length
    ? await prisma.productVariant.findMany({
        where: { id: { in: lowStockIds } },
        include: { product: true, color: true, size: true, volume: true },
      })
    : [];
  lowStockVariants.sort((a, b) => a.stockQuantity - b.stockQuantity);

  return {
    newOrders,
    monthOrders,
    prevMonthOrders,
    monthRevenue: toNumber(monthAgg._sum.totalSnapshot) ?? 0,
    monthAvgBasket: toNumber(monthAgg._avg.totalSnapshot) ?? 0,
    outOfStockCount,
    lowStockCount,
    recentOrders,
    lowStock: lowStockVariants.map((v) => ({
      productId: v.productId,
      productName: v.product.name,
      variantLabel: buildVariantLabel(v),
      stock: v.stockQuantity,
    })),
  };
}
