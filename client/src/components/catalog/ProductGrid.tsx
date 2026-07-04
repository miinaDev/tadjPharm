import type { Product } from "../../types";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "../common/EmptyState";

interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({ products, emptyTitle, emptyDescription }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle ?? "Aucun produit pour le moment"}
        description={emptyDescription ?? "Revenez bientot, notre catalogue est mis a jour regulierement."}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
