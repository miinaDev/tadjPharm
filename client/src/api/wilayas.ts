import { apiClient } from "./client";
import type { Wilaya } from "../types";

export const wilayasApi = {
  getWilayas: () => apiClient.get<Wilaya[]>("/api/wilayas"),
};
