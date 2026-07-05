import { useEffect, useRef, useState } from "react";
import type { ProductImage } from "../../types";
import { resolveMediaUrl } from "../../api/client";

export function ProductImageGallery({
  images,
  alt,
  focusImageId,
}: {
  images: ProductImage[];
  alt: string;
  focusImageId?: string | null;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = images[activeIndex];

  // Quand une couleur liee est selectionnee, on affiche son image et on remonte a la galerie.
  useEffect(() => {
    if (!focusImageId) return;
    const idx = images.findIndex((img) => img.id === focusImageId);
    if (idx >= 0) {
      setActiveIndex(idx);
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    // On ne depend que de focusImageId : eviter de re-defiler lors d'un refetch du produit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusImageId]);

  return (
    <div ref={rootRef} className="flex flex-col gap-3">
      <div className="aspect-square w-full overflow-hidden rounded-3xl bg-white shadow-sm">
        {active ? (
          <img src={resolveMediaUrl(active.url, 1200)} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-300">Pas d'image</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl transition ${
                index === activeIndex ? "ring-2 ring-brand-500 ring-offset-2" : "opacity-70 hover:opacity-100"
              }`}
            >
              <img src={resolveMediaUrl(image.url, 160)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
