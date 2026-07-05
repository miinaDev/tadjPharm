import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useCategories } from "../../hooks/useCatalog";
import { TagListInput } from "./TagListInput";
import { ColorListInput, type ColorValue } from "./ColorListInput";
import { ImagePicker } from "./ImagePicker";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { Field, Input, Select, Textarea } from "../ui/Field";
import { Switch } from "../ui/Switch";
import { Button } from "../ui/Button";
import { discountedPrice } from "../../utils/pricing";
import type { CreateProductPayload } from "../../api/admin";

interface ProductFormProps {
  onSubmit: (payload: CreateProductPayload) => Promise<void>;
  submitting: boolean;
  images: File[];
  onImagesChange: (files: File[]) => void;
}

export function ProductForm({ onSubmit, submitting, images, onImagesChange }: ProductFormProps) {
  const { data: categories } = useCategories();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [ribbonLabel, setRibbonLabel] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [hasColors, setHasColors] = useState(false);
  const [hasSizes, setHasSizes] = useState(false);
  const [hasVolumes, setHasVolumes] = useState(false);
  const [colors, setColors] = useState<ColorValue[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [volumes, setVolumes] = useState<string[]>([]);
  const [initialStock, setInitialStock] = useState("0");
  const [trackStock, setTrackStock] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const hasAnyOption = hasColors || hasSizes || hasVolumes;
  const selectedCategory = categories?.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  const priceNum = Number(basePrice);
  const discountNum = Number(discountPercent) || 0;
  const reducedPreview = priceNum > 0 && discountNum > 0 ? discountedPrice(priceNum, discountNum) : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const price = Number(basePrice);
    if (!name || !categoryId || Number.isNaN(price) || price <= 0) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const parsedThreshold = parseInt(lowStockThreshold, 10);
    await onSubmit({
      name,
      description,
      basePrice: price,
      discountPercent: Number(discountPercent) || 0,
      ribbonLabel: ribbonLabel.trim() || null,
      categoryId,
      subcategoryId: subcategoryId || null,
      hasColors,
      hasSizes,
      hasVolumes,
      colors: colors.map((c) => ({ label: c.label, hexCode: c.hexCode })),
      sizes: sizes.map((label) => ({ label })),
      volumes: volumes.map((label) => ({ label })),
      initialStock: hasAnyOption ? 0 : Number(initialStock) || 0,
      trackStock,
      lowStockThreshold: Number.isNaN(parsedThreshold) ? 0 : Math.max(0, parsedThreshold),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card>
        <CardHeader title="Informations generales" description="Le nom, le descriptif et le prix affiches sur la fiche produit" />
        <CardBody className="flex flex-col gap-4">
          <Field label="Nom du produit" htmlFor="name" required>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Cannes anglaises reglables" />
          </Field>

          <Field label="Description" htmlFor="description" hint="Optionnel">
            <Textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Decrivez le produit, ses caracteristiques, son usage..."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Prix (DA)" htmlFor="price" required>
              <Input id="price" required type="number" min={0} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
            </Field>
            <Field label="Taux de reduction (%)" htmlFor="discount" hint="0 = pas de promo">
              <Input
                id="discount"
                type="number"
                min={0}
                max={100}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
              />
            </Field>
            <Field label="Prix reduit (DA)" htmlFor="reduced" hint="Calcule automatiquement">
              <Input id="reduced" type="text" disabled value={reducedPreview != null ? reducedPreview.toLocaleString("fr-FR") : "—"} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categorie" htmlFor="category" required>
              <Select
                id="category"
                required
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategoryId("");
                }}
              >
                <option value="">Selectionner...</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            {subcategories.length > 0 ? (
              <Field label="Sous-categorie" htmlFor="subcategory" hint="Optionnel">
                <Select id="subcategory" value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)}>
                  <option value="">— Aucune —</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field label="Ruban / etiquette" htmlFor="ribbon" hint="Laisser vide pour aucun ruban">
                <Input id="ribbon" type="text" maxLength={30} value={ribbonLabel} onChange={(e) => setRibbonLabel(e.target.value)} placeholder="Ex: Promo, Nouveaute" />
              </Field>
            )}
          </div>
          {subcategories.length > 0 && (
            <Field label="Ruban / etiquette" htmlFor="ribbon" hint="Laisser vide pour aucun ruban">
              <Input id="ribbon" type="text" maxLength={30} value={ribbonLabel} onChange={(e) => setRibbonLabel(e.target.value)} placeholder="Ex: Promo, Nouveaute" />
            </Field>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Options du produit" description="Activez les options pertinentes puis ajoutez les valeurs disponibles" />
        <CardBody className="flex flex-col gap-4">
          <div>
            <Switch checked={hasColors} onChange={setHasColors} label="Couleurs" description="Le client choisit une couleur" />
            {hasColors && (
              <div className="mt-2">
                <ColorListInput values={colors} onChange={setColors} placeholder="Ajouter une couleur..." />
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <Switch checked={hasSizes} onChange={setHasSizes} label="Tailles" description="Le client choisit une taille" />
            {hasSizes && (
              <div className="mt-2">
                <TagListInput values={sizes} onChange={setSizes} placeholder="Ajouter une taille..." />
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <Switch checked={hasVolumes} onChange={setHasVolumes} label="Volume / contenance" description="Produit liquide, ex: 250ml" />
            {hasVolumes && (
              <div className="mt-2">
                <TagListInput values={volumes} onChange={setVolumes} placeholder="Ajouter un volume..." />
              </div>
            )}
          </div>

          {!hasAnyOption && (
            <div className="border-t border-slate-100 pt-4">
              <Field label="Stock initial" htmlFor="stock" hint="Aucune option activee : un seul stock est suivi pour ce produit.">
                <Input id="stock" type="number" min={0} value={initialStock} onChange={(e) => setInitialStock(e.target.value)} className="max-w-[160px]" />
              </Field>
            </div>
          )}

          {hasAnyOption && (
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
              Apres creation, ajoutez les combinaisons (ex: Rouge / M) et leur stock sur la page du produit.
            </p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Suivi de stock" description="Gerez la disponibilite et les alertes de stock de ce produit" />
        <CardBody className="flex flex-col gap-4">
          <Switch
            checked={trackStock}
            onChange={setTrackStock}
            label="Suivi de stock"
            description="Desactivez pour un produit toujours disponible (le stock n'est pas decompte a la commande)"
          />
          {trackStock ? (
            <Field
              label="Seuil de stock bas"
              htmlFor="low-stock"
              hint="Une alerte apparait sur le tableau de bord des qu'une variante atteint ce niveau ou moins"
            >
              <Input
                id="low-stock"
                type="number"
                min={0}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="max-w-[160px]"
              />
            </Field>
          ) : (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Le suivi de stock est desactive : ce produit sera toujours affiche comme disponible et les commandes ne
              decompteront pas le stock.
            </p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Images" description="La premiere image sera utilisee comme visuel principal" />
        <CardBody>
          <ImagePicker files={images} onChange={onImagesChange} />
        </CardBody>
      </Card>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Enregistrement..." : "Creer le produit"}
        </Button>
        <Link to="/admin/produits">
          <Button type="button" variant="ghost">
            Annuler
          </Button>
        </Link>
      </div>
    </form>
  );
}
