import { Link } from "react-router-dom";
import type { Product } from "../../types";
import { resolveMediaUrl } from "../../api/client";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  const inStock = product.variants.some((v) => v.stockQuantity > 0);

  return (
    <Link to={`/produit/${product.slug}`} className="group flex flex-col gap-2.5">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white shadow-sm transition group-hover:shadow-md">
        {image ? (
          <img
            src={resolveMediaUrl(image.url)}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-300">Pas d'image</div>
        )}
        {!inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-red-500 shadow-sm">
            Rupture
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-1">
        <h3 className="truncate text-sm text-slate-500">{product.name}</h3>
        <span className="shrink-0 text-sm font-semibold text-slate-800">
          {product.basePrice.toLocaleString("fr-FR")} DA
        </span>
      </div>
    </Link>
  );
}
