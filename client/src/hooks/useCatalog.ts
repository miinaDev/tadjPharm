import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../api/catalog";

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: catalogApi.getCategories });
}

export function useProducts(
  params: { categorySlug?: string; subcategorySlug?: string; search?: string; page?: number; pageSize?: number } = {}
) {
  return useQuery({
    queryKey: [
      "products",
      params.categorySlug ?? null,
      params.subcategorySlug ?? null,
      params.search ?? null,
      params.page ?? 1,
      params.pageSize ?? null,
    ],
    queryFn: () => catalogApi.getProducts(params),
    placeholderData: (prev) => prev,
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => catalogApi.getProductBySlug(slug as string),
    enabled: Boolean(slug),
  });
}
