import { apiClient } from "./client";
import type { Order } from "../types";

export interface CreateOrderPayload {
  items: { variantId: string; quantity: number }[];
  wilayaId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export const ordersApi = {
  createOrder: (payload: CreateOrderPayload) => apiClient.post<Order>("/api/orders", payload),
  getOrder: (id: string) => apiClient.get<Order>(`/api/orders/${id}`),
};
