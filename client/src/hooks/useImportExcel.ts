import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminImportApi } from "../api/admin";

export function useImportExcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => adminImportApi.importProducts(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}
