import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminWilayasApi } from "../api/admin";

export function useAdminWilayas() {
  return useQuery({ queryKey: ["admin", "wilayas"], queryFn: adminWilayasApi.list });
}

export function useWilayaCatalog() {
  return useQuery({ queryKey: ["admin", "wilayas", "catalog"], queryFn: adminWilayasApi.catalog });
}

function useInvalidateWilayas() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["admin", "wilayas"] });
}

export function useUpdateWilaya() {
  const invalidate = useInvalidateWilayas();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; homePrice?: number; officePrice?: number; isActive?: boolean }) =>
      adminWilayasApi.update(id, payload),
    onSuccess: invalidate,
  });
}

export function useCreateWilaya() {
  const invalidate = useInvalidateWilayas();
  return useMutation({
    mutationFn: (payload: { id?: number; name?: string }) => adminWilayasApi.create(payload),
    onSuccess: invalidate,
  });
}

export function useDeleteWilaya() {
  const invalidate = useInvalidateWilayas();
  return useMutation({ mutationFn: (id: number) => adminWilayasApi.remove(id), onSuccess: invalidate });
}

export function useCreateBureau() {
  const invalidate = useInvalidateWilayas();
  return useMutation({
    mutationFn: ({ wilayaId, name }: { wilayaId: number; name: string }) => adminWilayasApi.createBureau(wilayaId, name),
    onSuccess: invalidate,
  });
}

export function useUpdateBureau() {
  const invalidate = useInvalidateWilayas();
  return useMutation({
    mutationFn: ({ bureauId, ...payload }: { bureauId: string; name?: string; isActive?: boolean }) =>
      adminWilayasApi.updateBureau(bureauId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteBureau() {
  const invalidate = useInvalidateWilayas();
  return useMutation({ mutationFn: (bureauId: string) => adminWilayasApi.deleteBureau(bureauId), onSuccess: invalidate });
}
