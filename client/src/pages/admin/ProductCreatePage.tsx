import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductForm } from "../../components/admin/ProductForm";
import { useCreateProduct } from "../../hooks/useAdminProducts";
import { adminProductsApi, type CreateProductPayload } from "../../api/admin";
import { ApiError } from "../../api/client";
import { PageHeader } from "../../components/ui/PageHeader";
import { Button } from "../../components/ui/Button";

export function ProductCreatePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const [images, setImages] = useState<File[]>([]);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  async function uploadImagesAndFinish(productId: string) {
    setUploadingImages(true);
    setImageUploadError(null);
    try {
      if (images.length > 0) {
        await adminProductsApi.uploadImages(productId, images);
      }
      navigate(`/admin/produits/${productId}`, { state: { justCreated: true } });
    } catch (err) {
      // Le produit existe deja : on reste sur cette page pour permettre de reessayer l'envoi des images.
      setImageUploadError(
        err instanceof ApiError ? err.message : "Echec de l'envoi des images. Vous pouvez reessayer sans perdre vos informations."
      );
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleSubmit(payload: CreateProductPayload) {
    const product = await createProduct.mutateAsync(payload);
    setCreatedProductId(product.id);
    await uploadImagesAndFinish(product.id);
  }

  const isBusy = createProduct.isPending || uploadingImages;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Nouveau produit" description="Ajoutez un produit au catalogue" />

      {createdProductId && imageUploadError ? (
        <div className="flex flex-col gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>
            Le produit a bien ete cree, mais l&apos;envoi des images a echoue : {imageUploadError}
          </p>
          <div>
            <Button type="button" variant="primary" disabled={uploadingImages} onClick={() => uploadImagesAndFinish(createdProductId)}>
              {uploadingImages ? "Nouvel essai..." : "Reessayer l'envoi des images"}
            </Button>
          </div>
        </div>
      ) : null}

      <fieldset disabled={Boolean(createdProductId)} className="contents">
        <ProductForm onSubmit={handleSubmit} submitting={isBusy} images={images} onImagesChange={setImages} />
      </fieldset>
    </div>
  );
}
