import { useMutation } from "@tanstack/react-query";
import { ordersApi } from "../api/orders";

export function useCreateOrder() {
  return useMutation({ mutationFn: ordersApi.createOrder });
}
