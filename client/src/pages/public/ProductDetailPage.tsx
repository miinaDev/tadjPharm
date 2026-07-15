import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProduct } from "../../hooks/useCatalog";
import { useCart } from "../../context/CartContext";
import { ProductImageGallery } from "../../components/product/ProductImageGallery";
import { VariantSelector, resolveSelectedVariant, type VariantSelection } from "../../components/product/VariantSelector";
import { QuantityStepper } from "../../components/order/QuantityStepper";
import { PriceTag } from "../../components/product/PriceTag";
import { CheckoutModal, type CheckoutLine } from "../../components/order/CheckoutModal";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { discountedPrice, hasPromo } from "../../utils/pricing";
import type { Product, ProductVariant } from "../../types";

// Plafond de quantite raisonnable (plus de gestion de stock : le client choisit librement).
const MAX_QUANTITY = 99;

function variantLabel(variant: ProductVariant) {
  const parts = [variant.color?.label, variant.size?.label, variant.volume?.label].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Standard";
}

// "la couleur", "la taille et la contenance", etc.
function joinFr(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

function buildCartItem(product: Product, variant: ProductVariant, unitPrice: number) {
  return {
    variantId: variant.id,
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    variantLabel: variantLabel(variant),
    imageUrl: product.images[0]?.url ?? null,
    unitPrice,
    isDeliverable: product.isDeliverable,
  };
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);
  const cart = useCart();
  const [selection, setSelection] = useState<VariantSelection>({ colorId: null, sizeId: null, volumeId: null });
  const [quantity, setQuantity] = useState(1);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);
  const [focusImageId, setFocusImageId] = useState<string | null>(null);

  const selectedVariant = product ? resolveSelectedVariant(product, selection) : undefined;

  // Selectionner une couleur liee a une image demande a la galerie d'afficher cette image.
  useEffect(() => {
    if (!product || !selection.colorId) return;
    const linked = product.images.find((img) => img.colorId === selection.colorId);
    if (linked) setFocusImageId(linked.id);
  }, [selection.colorId, product]);

  useEffect(() => {
    if (selectedVariant) {
      setQuantity((q) => Math.min(Math.max(q, 1), MAX_QUANTITY));
    } else {
      setQuantity(1);
    }
  }, [selectedVariant]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!product) {
    return <EmptyState title="Produit introuvable" description="Ce produit n'est plus disponible." />;
  }

  const regular = selectedVariant?.priceOverride ?? product.basePrice;
  const promo = hasPromo(product);
  const price = discountedPrice(regular, product.discountPercent); // prix effectif (panier + checkout)
  // Achetable si le produit est disponible et que la combinaison choisie est resolue ET active.
  // Les produits a livraison speciale restent commandables (le tarif de livraison est fixe ensuite).
  const canBuy = Boolean(product.isAvailable && selectedVariant && selectedVariant.isActive);
  const maxQuantity = MAX_QUANTITY;
  const hasOptions = product.hasColors || product.hasSizes || product.hasVolumes;

  // Le produit a des options mais aucune variante n'est encore resolue : on invite a les choisir.
  const missingOptions = [
    product.hasColors && !selection.colorId && "la couleur",
    product.hasSizes && !selection.sizeId && "la taille",
    product.hasVolumes && !selection.volumeId && "la contenance",
  ].filter((v): v is string => Boolean(v));
  const needsSelection = hasOptions && !selectedVariant;
  const selectionHint = !needsSelection
    ? null
    : missingOptions.length > 0
      ? `Veuillez sélectionner ${joinFr(missingOptions)} pour commander.`
      : "Cette combinaison n'est pas disponible.";

  const checkoutLine: CheckoutLine[] = selectedVariant
    ? [{ ...buildCartItem(product, selectedVariant, price), quantity }]
    : [];

  function handleAddToCart() {
    if (!product || !selectedVariant) return;
    cart.addItem(buildCartItem(product, selectedVariant, price), quantity);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1600);
  }

  return (
    <div>
      <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Retour
      </Link>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
        <ProductImageGallery images={product.images} alt={product.name} focusImageId={focusImageId} />

        <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm sm:p-7">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-500">
                {product.category.name}
                {product.subcategory && <span className="text-slate-400"> · {product.subcategory.name}</span>}
              </span>
              {product.ribbonLabel && (
                <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white">{product.ribbonLabel}</span>
              )}
            </div>
            <div className="mt-1.5 flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold leading-tight text-slate-900">{product.name}</h1>
              {promo ? (
                <div className="flex shrink-0 flex-col items-end leading-tight">
                  <PriceTag amount={regular} className="text-sm text-slate-400 line-through" />
                  <PriceTag amount={price} className="text-2xl font-bold text-brand-600" />
                </div>
              ) : (
                <PriceTag amount={price} className="shrink-0 text-2xl font-bold text-slate-900" />
              )}
            </div>
          </div>

          {product.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-500">{product.description}</p>
          )}

          {hasOptions && (
            <VariantSelector
              product={product}
              selection={selection}
              onChange={(patch) => setSelection((s) => ({ ...s, ...patch }))}
            />
          )}

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Quantite</p>
            <div className="flex items-center gap-4">
              <QuantityStepper quantity={quantity} max={maxQuantity} onChange={setQuantity} />
            </div>
          </div>

          {!product.isAvailable && (
            <p className="text-sm font-medium text-red-500">Ce produit n'est pas disponible a la commande pour le moment.</p>
          )}

          {product.isAvailable && selectedVariant && !selectedVariant.isActive && (
            <p className="text-sm font-medium text-red-500">Cette combinaison n'est pas disponible.</p>
          )}

          {selectionHint && (
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {selectionHint}
            </div>
          )}

          {/* Livraison speciale : information non bloquante. On peut commander normalement ;
              le tarif de livraison sera communique par la parapharmacie. */}
          {!product.isDeliverable && (
            <div className="flex flex-col gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 001 1h2m-3-4h5.5a1 1 0 00.9-.55l1.6-3.2a1 1 0 00.1-.45V11a1 1 0 00-1-1h-4" />
                </svg>
                Livraison speciale
              </p>
              <p className="text-sm leading-relaxed text-amber-700">
                Vous pouvez commander normalement. Le tarif de livraison de ce produit vous sera communique par la
                parapharmacie lors de la confirmation.
              </p>
            </div>
          )}

          <div className="mt-1 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={!canBuy}
              onClick={handleAddToCart}
              className="inline-flex w-full items-center justify-center rounded-full bg-brand-50 px-6 py-3.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {addedFlash ? "Ajoute ✓" : "Ajouter au panier"}
            </button>
            <button
              type="button"
              disabled={!canBuy}
              onClick={() => setOrderModalOpen(true)}
              className="inline-flex w-full items-center justify-center rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
            >
              Acheter
            </button>
          </div>
        </div>
      </div>

      {orderModalOpen && selectedVariant && (
        <CheckoutModal
          lines={checkoutLine}
          onQuantityChange={(_variantId, q) => setQuantity(q)}
          onClose={() => setOrderModalOpen(false)}
        />
      )}
    </div>
  );
}
