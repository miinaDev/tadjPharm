import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductForm } from "../../components/admin/ProductForm";
import { useCreateProduct } from "../../hooks/useAdminProducts";
import { adminProductsApi, type CreateProductPayload } from "../../api/admin";
import { ApiError } from "../../api/client";
import { PageHeader } from "../../components/ui/PageHeader";

export function ProductCreatePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const [images, setImages] = useState<File[]>([]);

  async function handleSubmit(payload: CreateProductPayload) {
    const product = await createProduct.mutateAsync(payload);

    let uploadError: string | null = null;
    if (images.length > 0) {
      try {
        await adminProductsApi.uploadImages(product.id, images);
      } catch (err) {
        // Le produit est deja cree : on continue vers la page d'edition ou l'admin pourra reessayer.
        uploadError = err instanceof ApiError ? err.message : "Echec de l'envoi des images, vous pourrez reessayer sur la page du produit.";
      }
    }

    navigate(`/admin/produits/${product.id}`, uploadError ? { state: { imageError: uploadError } } : undefined);
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Nouveau produit" description="Ajoutez un produit au catalogue" />
      <ProductForm onSubmit={handleSubmit} submitting={createProduct.isPending} images={images} onImagesChange={setImages} />
    </div>
  );
}
