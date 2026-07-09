import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { discountedPrice } from "../../utils/pricing";

const PRODUCT_INFO_FORM_ID = "product-info-form";

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { justCreated?: boolean } | null;
  const justCreated = navState?.justCreated ?? false;
  const { data: product, isLoading } = useAdminProduct(id);
  const { data: categories } = useCategories();
  const updateProduct = useUpdateProduct(id ?? "");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [ribbonLabel, setRibbonLabel] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setBasePrice(String(product.basePrice));
      setDiscountPercent(String(product.discountPercent));
      setRibbonLabel(product.ribbonLabel ?? "");
      setCategoryId(product.categoryId);
      setSubcategoryId(product.subcategoryId ?? "");
      setIsActive(product.isActive);
      setIsAvailable(product.isAvailable);
    }
  }, [product]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    await updateProduct.mutateAsync({
      name,
      description,
      basePrice: Number(basePrice),
      discountPercent: Number(discountPercent) || 0,
      ribbonLabel: ribbonLabel.trim() || null,
      categoryId,
      subcategoryId: subcategoryId || null,
      isActive,
      isAvailable,
    });
    // Une fois enregistre, on revient a la liste de gestion des produits.
    navigate("/admin/produits");
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
  const selectedCategory = categories?.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={product.name}
        action={<Badge tone={product.isActive ? "green" : "slate"}>{product.isActive ? "Actif" : "Inactif"}</Badge>}
      />

      {justCreated && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Produit cree avec succes. Vous pouvez encore ajuster ses informations, ses variantes ou ses images ci-dessous.
        </p>
      )}

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
                <Select
                  id="edit-category"
                  required
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategoryId("");
                  }}
                >
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              {subcategories.length > 0 ? (
                <Field label="Sous-categorie" htmlFor="edit-subcategory" hint="Optionnel">
                  <Select id="edit-subcategory" value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)}>
                    <option value="">— Aucune —</option>
                    {subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : (
                <Field label="Ruban / etiquette" htmlFor="edit-ribbon" hint="Laisser vide pour aucun ruban">
                  <Input id="edit-ribbon" type="text" maxLength={30} value={ribbonLabel} onChange={(e) => setRibbonLabel(e.target.value)} placeholder="Ex: Promo, Nouveaute" />
                </Field>
              )}
            </div>
            {subcategories.length > 0 && (
              <Field label="Ruban / etiquette" htmlFor="edit-ribbon" hint="Laisser vide pour aucun ruban">
                <Input id="edit-ribbon" type="text" maxLength={30} value={ribbonLabel} onChange={(e) => setRibbonLabel(e.target.value)} placeholder="Ex: Promo, Nouveaute" />
              </Field>
            )}

            <div className="border-t border-slate-100 pt-4">
              <Switch checked={isActive} onChange={setIsActive} label="Produit actif" description="Visible sur le site public" />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <Switch
                checked={isAvailable}
                onChange={setIsAvailable}
                label="Disponible a la commande"
                description="Desactivez pour empecher les clients de commander ce produit (il reste visible)"
              />
            </div>
          </form>
        </CardBody>
      </Card>

      <div className="flex flex-col gap-5">
        <ProductOptionsManager product={product} />
        <VariantMatrixEditor product={product} />
      </div>
      <ImageUploader product={product} />

      <Card>
        <CardBody className="flex items-center gap-3">
          <Button type="submit" form={PRODUCT_INFO_FORM_ID} variant="primary" disabled={updateProduct.isPending}>
            {updateProduct.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
