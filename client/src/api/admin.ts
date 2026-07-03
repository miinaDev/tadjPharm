import { apiClient } from "./client";
import type { AdminUser, Order, OrderStatus, Product, ProductVariant, Wilaya } from "../types";

export interface CreateProductPayload {
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  hasColors: boolean;
  hasSizes: boolean;
  hasVolumes: boolean;
  colors: { label: string; hexCode?: string }[];
  sizes: { label: string }[];
  volumes: { label: string }[];
  initialStock: number;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  basePrice?: number;
  categoryId?: string;
  isActive?: boolean;
}

export interface ImportSummary {
  totalRows: number;
  created: number;
  failed: number;
  errors: { row: number; message: string }[];
}

export const adminAuthApi = {
  login: (email: string, password: string) => apiClient.post<AdminUser>("/api/admin/auth/login", { email, password }),
  logout: () => apiClient.post<void>("/api/admin/auth/logout"),
  me: () => apiClient.get<AdminUser>("/api/admin/auth/me"),
};

export const adminProductsApi = {
  list: (page = 1, pageSize = 50) => apiClient.get<{ products: Product[]; total: number }>(`/api/admin/products?page=${page}&pageSize=${pageSize}`),
  get: (id: string) => apiClient.get<Product>(`/api/admin/products/${id}`),
  create: (payload: CreateProductPayload) => apiClient.post<Product>("/api/admin/products", payload),
  update: (id: string, payload: UpdateProductPayload) => apiClient.put<Product>(`/api/admin/products/${id}`, payload),
  remove: (id: string) => apiClient.delete<{ softDeleted: boolean }>(`/api/admin/products/${id}`),
  addOption: (productId: string, type: "color" | "size" | "volume", label: string, hexCode?: string) =>
    apiClient.post<Product>(`/api/admin/products/${productId}/options`, { type, label, hexCode }),
  removeOption: (productId: string, type: "color" | "size" | "volume", optionId: string) =>
    apiClient.delete<Product>(`/api/admin/products/${productId}/options/${type}/${optionId}`),
  createVariant: (
    productId: string,
    payload: { colorId?: string | null; sizeId?: string | null; volumeId?: string | null; stockQuantity: number; priceOverride?: number | null }
  ) => apiClient.post<ProductVariant>(`/api/admin/products/${productId}/variants`, payload),
  updateVariant: (variantId: string, payload: { stockQuantity?: number; priceOverride?: number | null }) =>
    apiClient.put<ProductVariant>(`/api/admin/variants/${variantId}`, payload),
  deleteVariant: (variantId: string) => apiClient.delete<void>(`/api/admin/variants/${variantId}`),
  uploadImages: (productId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return apiClient.post(`/api/admin/products/${productId}/images`, formData);
  },
  deleteImage: (imageId: string) => apiClient.delete<void>(`/api/admin/images/${imageId}`),
};

export const adminOrdersApi = {
  list: (params: { page?: number; pageSize?: number; status?: OrderStatus; wilayaId?: number; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    if (params.status) query.set("status", params.status);
    if (params.wilayaId) query.set("wilayaId", String(params.wilayaId));
    if (params.search) query.set("search", params.search);
    return apiClient.get<{ orders: Order[]; total: number }>(`/api/admin/orders?${query.toString()}`);
  },
  updateStatus: (id: string, status: OrderStatus) => apiClient.patch<Order>(`/api/admin/orders/${id}/status`, { status }),
};

export const adminWilayasApi = {
  list: () => apiClient.get<Wilaya[]>("/api/admin/wilayas"),
  update: (id: number, payload: { deliveryPrice?: number; isActive?: boolean }) =>
    apiClient.put<Wilaya>(`/api/admin/wilayas/${id}`, payload),
};

export const adminImportApi = {
  importProducts: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ImportSummary>("/api/admin/import/products", formData);
  },
  templateUrl: () => `${import.meta.env.VITE_API_URL ?? "http://localhost:4000"}/api/admin/import/template`,
};
