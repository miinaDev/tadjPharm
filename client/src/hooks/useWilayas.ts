import { useQuery } from "@tanstack/react-query";
import { wilayasApi } from "../api/wilayas";

export function useWilayas() {
  return useQuery({ queryKey: ["wilayas"], queryFn: wilayasApi.getWilayas });
}
