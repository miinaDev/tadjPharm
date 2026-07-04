import { useQuery } from "@tanstack/react-query";
import { adminStatsApi } from "../api/admin";

export function useAdminStats() {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: adminStatsApi.get });
}
