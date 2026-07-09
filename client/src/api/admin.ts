import { apiClient } from "./client";
import type {
  AdminCategory,
  AdminUser,
  Category,
  DashboardStats,
  DeliveryBureau,
  Order,
  OrderStatus,
  Product,
  ProductVariant,
  Subcategory,
  Wilaya,
} from "../types";

export interface CreateProductPayload {
  name: string;
  description: string;
  basePrice: number;
  discountPercent?: number;
  ribbonLabel?: string | null;
  categoryId: string;
  subcategoryId?: string | null;
  hasColors: boolean;
  hasSizes: boolean;
  hasVolumes: boolean;
  colors: { label: string; hexCode?: string }[];
  sizes: { label: string }[];
  volumes: { label: string }[];
  variants: { colorLabel?: string; sizeLabel?: string; volumeLabel?: string; priceOverride?: number | null; isActive: boolean }[];
  isAvailable: boolean;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  basePrice?: number;
  discountPercent?: number;
  ribbonLabel?: string | null;
  categoryId?: string;
  subcategoryId?: string | null;
  isActive?: boolean;
  isAvailable?: boolean;
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
  list: (params: { page?: number; pageSize?: number; search?: string; status?: "active" | "inactive" } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    return apiClient.get<{ products: Product[]; total: number; activeCount: number; inactiveCount: number }>(
      `/api/admin/products${qs ? `?${qs}` : ""}`
    );
  },
  get: (id: string) => apiClient.get<Product>(`/api/admin/products/${id}`),
  create: (payload: CreateProductPayload) => apiClient.post<Product>("/api/admin/products", payload),
  update: (id: string, payload: UpdateProductPayload) => apiClient.put<Product>(`/api/admin/products/${id}`, payload),
  remove: (id: string) => apiClient.delete<{ softDeleted: boolean }>(`/api/admin/products/${id}`),
  addOption: (productId: string, type: "color" | "size" | "volume", label: string, hexCode?: string) =>
    apiClient.post<Product>(`/api/admin/products/${productId}/options`, { type, label, hexCode }),
  removeOption: (productId: string, type: "color" | "size" | "volume", optionId: string) =>
    apiClient.delete<Product>(`/api/admin/products/${productId}/options/${type}/${optionId}`),
  updateColor: (productId: string, colorId: string, payload: { hexCode?: string; label?: string }) =>
    apiClient.put<Product>(`/api/admin/products/${productId}/colors/${colorId}`, payload),
  createVariant: (
    productId: string,
    payload: { colorId?: string | null; sizeId?: string | null; volumeId?: string | null; priceOverride?: number | null }
  ) => apiClient.post<ProductVariant>(`/api/admin/products/${productId}/variants`, payload),
  updateVariant: (variantId: string, payload: { priceOverride?: number | null; isActive?: boolean }) =>
    apiClient.put<ProductVariant>(`/api/admin/variants/${variantId}`, payload),
  deleteVariant: (variantId: string) => apiClient.delete<void>(`/api/admin/variants/${variantId}`),
  uploadImages: (productId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return apiClient.post(`/api/admin/products/${productId}/images`, formData);
  },
  deleteImage: (imageId: string) => apiClient.delete<void>(`/api/admin/images/${imageId}`),
  setImageColor: (productId: string, imageId: string, colorId: string | null) =>
    apiClient.put<Product>(`/api/admin/products/${productId}/images/${imageId}`, { colorId }),
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
  catalog: () => apiClient.get<{ id: number; name: string }[]>("/api/admin/wilayas/catalog"),
  create: (payload: { id?: number; name?: string }) => apiClient.post<Wilaya>("/api/admin/wilayas", payload),
  update: (id: number, payload: { homePrice?: number; officePrice?: number; isActive?: boolean }) =>
    apiClient.put<Wilaya>(`/api/admin/wilayas/${id}`, payload),
  remove: (id: number) => apiClient.delete<void>(`/api/admin/wilayas/${id}`),
  createBureau: (wilayaId: number, name: string) =>
    apiClient.post<DeliveryBureau>(`/api/admin/wilayas/${wilayaId}/bureaus`, { name }),
  updateBureau: (bureauId: string, payload: { name?: string; isActive?: boolean }) =>
    apiClient.put<DeliveryBureau>(`/api/admin/bureaus/${bureauId}`, payload),
  deleteBureau: (bureauId: string) => apiClient.delete<void>(`/api/admin/bureaus/${bureauId}`),
};

export const adminCategoriesApi = {
  list: () => apiClient.get<AdminCategory[]>("/api/admin/categories"),
  create: (name: string) => apiClient.post<Category>("/api/admin/categories", { name }),
  update: (id: string, name: string) => apiClient.put<Category>(`/api/admin/categories/${id}`, { name }),
  remove: (id: string, password: string) =>
    apiClient.delete<{ movedProducts: number }>(`/api/admin/categories/${id}`, { password }),
  createSubcategory: (categoryId: string, name: string) =>
    apiClient.post<Subcategory>(`/api/admin/categories/${categoryId}/subcategories`, { name }),
  updateSubcategory: (subId: string, name: string) =>
    apiClient.put<Subcategory>(`/api/admin/subcategories/${subId}`, { name }),
  deleteSubcategory: (subId: string) => apiClient.delete<void>(`/api/admin/subcategories/${subId}`),
};

export const adminStatsApi = {
  get: () => apiClient.get<DashboardStats>("/api/admin/stats"),
};

export const adminImportApi = {
  importProducts: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ImportSummary>("/api/admin/import/products", formData);
  },
  templateUrl: () => `${import.meta.env.VITE_API_URL ?? "http://localhost:4000"}/api/admin/import/template`,
};
