import { apiClient } from "./client";
import type { Category, Product } from "../types";

export const catalogApi = {
  getCategories: () => apiClient.get<Category[]>("/api/categories"),
  getProducts: (
    params: { categorySlug?: string; subcategorySlug?: string; search?: string; page?: number; pageSize?: number } = {}
  ) => {
    const query = new URLSearchParams();
    if (params.categorySlug) query.set("categorySlug", params.categorySlug);
    if (params.subcategorySlug) query.set("subcategorySlug", params.subcategorySlug);
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    const qs = query.toString();
    return apiClient.get<{ products: Product[]; total: number }>(`/api/products${qs ? `?${qs}` : ""}`);
  },
  getProductBySlug: (slug: string) => apiClient.get<Product>(`/api/products/${slug}`),
};
