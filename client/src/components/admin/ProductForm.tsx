import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useCategories } from "../../hooks/useCatalog";
import { TagListInput } from "./TagListInput";
import { ColorListInput, type ColorValue } from "./ColorListInput";
import { ImagePicker } from "./ImagePicker";
import { VariantMatrixBuilder, type VariantRowValue } from "./VariantMatrixBuilder";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { Field, Input, Select, Textarea } from "../ui/Field";
import { Switch } from "../ui/Switch";
import { Button } from "../ui/Button";
import { discountedPrice } from "../../utils/pricing";
import { buildVariantCombos, comboKey } from "../../utils/variants";
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
  const [variantValues, setVariantValues] = useState<Record<string, VariantRowValue>>({});
  const [isAvailable, setIsAvailable] = useState(true);
  const [isDeliverable, setIsDeliverable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasAnyOption = hasColors || hasSizes || hasVolumes;
  const selectedCategory = categories?.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  const priceNum = Number(basePrice);
  const discountNum = Number(discountPercent) || 0;
  const reducedPreview = priceNum > 0 && discountNum > 0 ? discountedPrice(priceNum, discountNum) : null;

  const variantCombos = useMemo(
    () =>
      buildVariantCombos(
        hasColors,
        hasSizes,
        hasVolumes,
        colors.map((c) => c.label),
        sizes,
        volumes
      ),
    [hasColors, hasSizes, hasVolumes, colors, sizes, volumes]
  );

  function updateVariantValue(key: string, patch: Partial<VariantRowValue>) {
    setVariantValues((prev) => ({ ...prev, [key]: { ...(prev[key] ?? { priceOverride: "", isActive: true }), ...patch } }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const price = Number(basePrice);
    if (!name || !categoryId || Number.isNaN(price) || price <= 0) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (hasAnyOption && variantCombos.length === 0) {
      setError("Ajoutez au moins une valeur pour chaque option activee (couleur, taille, volume)");
      return;
    }

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
      variants: variantCombos.map((combo) => {
        const value = variantValues[comboKey(combo)] ?? { priceOverride: "", isActive: true };
        return {
          colorLabel: combo.colorLabel,
          sizeLabel: combo.sizeLabel,
          volumeLabel: combo.volumeLabel,
          priceOverride: value.priceOverride ? Number(value.priceOverride) : null,
          isActive: value.isActive,
        };
      }),
      isAvailable,
      isDeliverable,
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
        <CardHeader title="Options et variantes" description="Activez les options pertinentes, ajoutez les valeurs, puis definissez (optionnellement) un prix par combinaison" />
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

          {hasAnyOption && variantCombos.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-700">Variantes : prix optionnel et activation par combinaison</p>
              <VariantMatrixBuilder combos={variantCombos} values={variantValues} onChange={updateVariantValue} basePrice={priceNum || 0} />
            </div>
          )}

          {hasAnyOption && variantCombos.length === 0 && (
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
              Ajoutez au moins une valeur pour chaque option activee : le tableau des combinaisons apparaitra ici.
            </p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Disponibilite et livraison" description="Un produit non disponible reste visible mais ne peut pas etre commande" />
        <CardBody className="flex flex-col gap-4">
          <Switch
            checked={isAvailable}
            onChange={setIsAvailable}
            label="Disponible a la commande"
            description="Desactivez pour empecher les clients de commander ce produit (rupture, arret temporaire...)"
          />
          <div className="border-t border-slate-100 pt-4">
            <Switch
              checked={isDeliverable}
              onChange={setIsDeliverable}
              label="Livrable normalement"
              description="Desactivez pour une livraison speciale : le bouton acheter est remplace par une invitation a contacter la boutique pour un tarif"
            />
          </div>
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
          {submitting ? "Creation en cours..." : "Creer le produit"}
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
