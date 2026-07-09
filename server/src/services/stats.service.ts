import { prisma } from "../prisma";
import { toNumber } from "../utils/decimal";
import { getRecentOrders } from "./order.service";

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Plus de gestion de stock : la seule alerte catalogue est "produit actif mais non disponible".
  const [newOrders, monthOrders, prevMonthOrders, monthAgg, unavailableCount, recentOrders, unavailableProducts] =
    await Promise.all([
      prisma.order.count({ where: { status: "NOUVELLE" } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfPrevMonth, lt: startOfMonth } } }),
      prisma.order.aggregate({
        _sum: { totalSnapshot: true },
        _avg: { totalSnapshot: true },
        where: { createdAt: { gte: startOfMonth }, status: { not: "ANNULEE" } },
      }),
      prisma.product.count({ where: { isActive: true, isAvailable: false } }),
      getRecentOrders(8),
      prisma.product.findMany({
        where: { isActive: true, isAvailable: false },
        select: { id: true, name: true },
        orderBy: { updatedAt: "desc" },
        take: 12,
      }),
    ]);

  return {
    newOrders,
    monthOrders,
    prevMonthOrders,
    monthRevenue: toNumber(monthAgg._sum.totalSnapshot) ?? 0,
    monthAvgBasket: toNumber(monthAgg._avg.totalSnapshot) ?? 0,
    unavailableCount,
    recentOrders,
    unavailable: unavailableProducts.map((p) => ({ productId: p.id, productName: p.name })),
  };
}
