import { apiClient } from "./client";
import type { Order, ShippingMethod } from "../types";

export interface CreateOrderPayload {
  items: { variantId: string; quantity: number }[];
  wilayaId: number;
  fullName: string;
  phone: string;
  shippingMethod: ShippingMethod;
  address?: string;
  bureauId?: string;
}

export const ordersApi = {
  createOrder: (payload: CreateOrderPayload) => apiClient.post<Order>("/api/orders", payload),
  getOrder: (id: string) => apiClient.get<Order>(`/api/orders/${id}`),
};
