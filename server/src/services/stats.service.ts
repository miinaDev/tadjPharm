import { prisma } from "../prisma";
import { toNumber } from "../utils/decimal";
import { getRecentOrders, buildVariantLabel } from "./order.service";

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    newOrders,
    monthOrders,
    prevMonthOrders,
    monthAgg,
    outOfStockCount,
    lowStockCount,
    recentOrders,
    lowStockVariants,
  ] = await Promise.all([
    prisma.order.count({ where: { status: "NOUVELLE" } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfPrevMonth, lt: startOfMonth } } }),
    prisma.order.aggregate({
      _sum: { totalSnapshot: true },
      _avg: { totalSnapshot: true },
      where: { createdAt: { gte: startOfMonth }, status: { not: "ANNULEE" } },
    }),
    prisma.productVariant.count({ where: { stockQuantity: 0, product: { isActive: true } } }),
    prisma.productVariant.count({ where: { stockQuantity: { gte: 1, lte: 5 }, product: { isActive: true } } }),
    getRecentOrders(8),
    prisma.productVariant.findMany({
      where: { stockQuantity: { lte: 5 }, product: { isActive: true } },
      include: { product: true, color: true, size: true, volume: true },
      orderBy: { stockQuantity: "asc" },
      take: 12,
    }),
  ]);

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
