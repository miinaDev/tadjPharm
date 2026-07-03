import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminWilayasApi } from "../api/admin";

export function useAdminWilayas() {
  return useQuery({ queryKey: ["admin", "wilayas"], queryFn: adminWilayasApi.list });
}

export function useUpdateWilaya() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; deliveryPrice?: number; isActive?: boolean }) =>
      adminWilayasApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "wilayas"] }),
  });
}
