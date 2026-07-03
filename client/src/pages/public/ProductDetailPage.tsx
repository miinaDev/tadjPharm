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
import type { Product, ProductVariant } from "../../types";

function variantLabel(variant: ProductVariant) {
  const parts = [variant.color?.label, variant.size?.label, variant.volume?.label].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Standard";
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
    maxStock: variant.stockQuantity,
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

  const selectedVariant = product ? resolveSelectedVariant(product, selection) : undefined;

  useEffect(() => {
    if (selectedVariant) {
      setQuantity((q) => Math.min(Math.max(q, 1), Math.max(selectedVariant.stockQuantity, 1)));
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

  const price = selectedVariant?.priceOverride ?? product.basePrice;
  const canBuy = Boolean(selectedVariant && selectedVariant.stockQuantity > 0);
  const maxQuantity = Math.max(1, selectedVariant?.stockQuantity ?? 1);
  const hasOptions = product.hasColors || product.hasSizes || product.hasVolumes;

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
        <ProductImageGallery images={product.images} alt={product.name} />

        <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm sm:p-7">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-500">{product.category.name}</span>
            <div className="mt-1.5 flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold leading-tight text-slate-900">{product.name}</h1>
              <PriceTag amount={price} className="shrink-0 text-2xl font-bold text-slate-900" />
            </div>
          </div>

          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-500">{product.description}</p>

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
              {selectedVariant && selectedVariant.stockQuantity > 0 && (
                <span className="text-xs text-slate-400">{selectedVariant.stockQuantity} en stock</span>
              )}
            </div>
          </div>

          {selectedVariant && selectedVariant.stockQuantity === 0 && (
            <p className="text-sm font-medium text-red-500">Rupture de stock pour cette combinaison</p>
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
