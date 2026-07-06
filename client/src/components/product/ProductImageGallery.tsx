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
  const [zoomOpen, setZoomOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = images[activeIndex];

  // Fermer la vue agrandie avec la touche Echap + bloquer le defilement de l'arriere-plan.
  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoomOpen]);

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
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="group block h-full w-full cursor-zoom-in"
            aria-label="Agrandir l'image"
          >
            <img
              src={resolveMediaUrl(active.url, 1200)}
              alt={alt}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </button>
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

      {zoomOpen && active && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Fermer"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <img
            src={resolveMediaUrl(active.url, 1600)}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-full cursor-zoom-out rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
