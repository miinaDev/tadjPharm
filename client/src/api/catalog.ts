import { apiClient } from "./client";
import type { Category, Product } from "../types";

export const catalogApi = {
  getCategories: () => apiClient.get<Category[]>("/api/categories"),
  getProducts: (params: { categorySlug?: string; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.categorySlug) query.set("categorySlug", params.categorySlug);
    if (params.search) query.set("search", params.search);
    const qs = query.toString();
    return apiClient.get<Product[]>(`/api/products${qs ? `?${qs}` : ""}`);
  },
  getProductBySlug: (slug: string) => apiClient.get<Product>(`/api/products/${slug}`),
};
