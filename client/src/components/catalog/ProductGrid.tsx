import type { Product } from "../../types";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "../common/EmptyState";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <EmptyState title="Aucun produit pour le moment" description="Revenez bientot, notre catalogue est mis a jour regulierement." />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
