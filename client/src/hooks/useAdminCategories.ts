import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminCategoriesApi } from "../api/admin";

export function useAdminCategories() {
  return useQuery({ queryKey: ["admin", "categories"], queryFn: adminCategoriesApi.list });
}

// Invalide la liste admin ET la liste publique (categories affichees sur le catalogue).
function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({ mutationFn: (name: string) => adminCategoriesApi.create(name), onSuccess: invalidate });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => adminCategoriesApi.update(id, name),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => adminCategoriesApi.remove(id, password),
    onSuccess: invalidate,
  });
}

export function useCreateSubcategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ categoryId, name }: { categoryId: string; name: string }) =>
      adminCategoriesApi.createSubcategory(categoryId, name),
    onSuccess: invalidate,
  });
}

export function useUpdateSubcategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ subId, name }: { subId: string; name: string }) => adminCategoriesApi.updateSubcategory(subId, name),
    onSuccess: invalidate,
  });
}

export function useDeleteSubcategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (subId: string) => adminCategoriesApi.deleteSubcategory(subId),
    onSuccess: invalidate,
  });
}
