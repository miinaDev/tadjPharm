import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminProductsApi, type CreateProductPayload, type UpdateProductPayload } from "../api/admin";

export interface AdminProductsQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: "active" | "inactive";
}

export function useAdminProducts(params: AdminProductsQuery) {
  return useQuery({
    queryKey: ["admin", "products", params],
    queryFn: () => adminProductsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => adminProductsApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => adminProductsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProductPayload) => adminProductsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "product", id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminProductsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useDeleteProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => adminProductsApi.remove(id))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useAddOption(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, label, hexCode }: { type: "color" | "size" | "volume"; label: string; hexCode?: string }) =>
      adminProductsApi.addOption(productId, type, label, hexCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] }),
  });
}

export function useRemoveOption(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, optionId }: { type: "color" | "size" | "volume"; optionId: string }) =>
      adminProductsApi.removeOption(productId, type, optionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] }),
  });
}

export function useUpdateColor(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ colorId, ...payload }: { colorId: string; hexCode?: string; label?: string }) =>
      adminProductsApi.updateColor(productId, colorId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] }),
  });
}

export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { colorId?: string | null; sizeId?: string | null; volumeId?: string | null; priceOverride?: number | null }) =>
      adminProductsApi.createVariant(productId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] }),
  });
}

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, ...payload }: { variantId: string; priceOverride?: number | null }) =>
      adminProductsApi.updateVariant(variantId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] }),
  });
}

export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) => adminProductsApi.deleteVariant(variantId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] }),
  });
}

export function useUploadImages(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => adminProductsApi.uploadImages(productId, files),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] }),
  });
}

export function useDeleteImage(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => adminProductsApi.deleteImage(imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] }),
  });
}

export function useSetImageColor(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, colorId }: { imageId: string; colorId: string | null }) =>
      adminProductsApi.setImageColor(productId, imageId, colorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] }),
  });
}
