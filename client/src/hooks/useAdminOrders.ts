import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOrdersApi } from "../api/admin";
import type { OrderStatus } from "../types";

export function useAdminOrders(filters: { status?: OrderStatus; wilayaId?: number; search?: string } = {}) {
  return useQuery({
    queryKey: ["admin", "orders", filters],
    queryFn: () => adminOrdersApi.list(filters),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => adminOrdersApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });
}
