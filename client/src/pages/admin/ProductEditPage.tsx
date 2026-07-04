import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAdminProduct, useUpdateProduct } from "../../hooks/useAdminProducts";
import { useCategories } from "../../hooks/useCatalog";
import { Spinner } from "../../components/common/Spinner";
import { ProductOptionsManager } from "../../components/admin/ProductOptionsManager";
import { VariantMatrixEditor } from "../../components/admin/VariantMatrixEditor";
import { ImageUploader } from "../../components/admin/ImageUploader";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import { Switch } from "../../components/ui/Switch";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { IconCheck } from "../../components/ui/icons";
import { discountedPrice } from "../../utils/pricing";

const PRODUCT_INFO_FORM_ID = "product-info-form";

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const imageError = (location.state as { imageError?: string } | null)?.imageError;
  const { data: product, isLoading } = useAdminProduct(id);
  const { data: categories } = useCategories();
  const updateProduct = useUpdateProduct(id ?? "");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [ribbonLabel, setRibbonLabel] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [trackStock, setTrackStock] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setBasePrice(String(product.basePrice));
      setDiscountPercent(String(product.discountPercent));
      setRibbonLabel(product.ribbonLabel ?? "");
      setCategoryId(product.categoryId);
      setIsActive(product.isActive);
      setTrackStock(product.trackStock);
      setLowStockThreshold(String(product.lowStockThreshold));
    }
  }, [product]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    const parsedThreshold = parseInt(lowStockThreshold, 10);
    await updateProduct.mutateAsync({
      name,
      description,
      basePrice: Number(basePrice),
      discountPercent: Number(discountPercent) || 0,
      ribbonLabel: ribbonLabel.trim() || null,
      categoryId,
      isActive,
      trackStock,
      lowStockThreshold: Number.isNaN(parsedThreshold) ? 5 : Math.max(0, parsedThreshold),
    });
    setSaved(true);
  }

  if (isLoading || !product) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const priceNum = Number(basePrice);
  const discountNum = Number(discountPercent) || 0;
  const reducedPreview = priceNum > 0 && discountNum > 0 ? discountedPrice(priceNum, discountNum) : null;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={product.name}
        action={<Badge tone={product.isActive ? "green" : "slate"}>{product.isActive ? "Actif" : "Inactif"}</Badge>}
      />

      {imageError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{imageError}</p>}

      <Card>
        <CardHeader title="Informations generales" />
        <CardBody>
          <form id={PRODUCT_INFO_FORM_ID} onSubmit={handleSave} className="flex flex-col gap-4">
            <Field label="Nom du produit" htmlFor="edit-name" required>
              <Input id="edit-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Description" htmlFor="edit-description" hint="Optionnel">
              <Textarea id="edit-description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Prix (DA)" htmlFor="edit-price" required>
                <Input id="edit-price" required type="number" min={0} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
              </Field>
              <Field label="Taux de reduction (%)" htmlFor="edit-discount" hint="0 = pas de promo">
                <Input
                  id="edit-discount"
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                />
              </Field>
              <Field label="Prix reduit (DA)" htmlFor="edit-reduced" hint="Calcule automatiquement">
                <Input id="edit-reduced" type="text" disabled value={reducedPreview != null ? reducedPreview.toLocaleString("fr-FR") : "—"} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categorie" htmlFor="edit-category" required>
                <Select id="edit-category" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Ruban / etiquette" htmlFor="edit-ribbon" hint="Laisser vide pour aucun ruban">
                <Input id="edit-ribbon" type="text" maxLength={30} value={ribbonLabel} onChange={(e) => setRibbonLabel(e.target.value)} placeholder="Ex: Promo, Nouveaute" />
              </Field>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <Switch checked={isActive} onChange={setIsActive} label="Produit actif" description="Visible sur le site public" />
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
              <Switch
                checked={trackStock}
                onChange={setTrackStock}
                label="Suivi de stock"
                description="Desactivez pour un produit toujours disponible (le stock n'est pas decompte a la commande)"
              />
              {trackStock && (
                <Field
                  label="Seuil de stock bas"
                  htmlFor="edit-low-stock"
                  hint="Une alerte apparait sur le tableau de bord des qu'une variante atteint ce niveau ou moins"
                >
                  <Input
                    id="edit-low-stock"
                    type="number"
                    min={0}
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="max-w-[160px]"
                  />
                </Field>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      <ProductOptionsManager product={product} />
      <VariantMatrixEditor product={product} />
      <ImageUploader product={product} />

      <Card>
        <CardBody className="flex items-center gap-3">
          <Button type="submit" form={PRODUCT_INFO_FORM_ID} variant="primary" disabled={updateProduct.isPending}>
            {updateProduct.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <IconCheck className="h-4 w-4" /> Modifications enregistrees
            </span>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
