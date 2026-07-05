import { useRef, useState, type DragEvent } from "react";
import type { Product } from "../../types";
import { useDeleteImage, useSetImageColor, useUploadImages } from "../../hooks/useAdminProducts";
import { resolveMediaUrl } from "../../api/client";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { IconTrash, IconUpload } from "../ui/icons";
import { Spinner } from "../common/Spinner";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function ImageUploader({ product }: { product: Product }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImages = useUploadImages(product.id);
  const deleteImage = useDeleteImage(product.id);
  const setImageColor = useSetImageColor(product.id);
  const [isDragging, setIsDragging] = useState(false);
  const hasColors = product.colors.length > 0;

  async function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const accepted = Array.from(list).filter((f) => ACCEPTED_TYPES.has(f.type));
    if (accepted.length > 0) await uploadImages.mutateAsync(accepted);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

  return (
    <Card>
      <CardHeader
        title="Images"
        description={
          hasColors
            ? "La premiere image est le visuel principal. Liez une image a une couleur pour l'afficher quand le client la selectionne."
            : "La premiere image est utilisee comme visuel principal"
        }
      />
      <CardBody className="flex flex-col gap-4">
        {product.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {product.images.map((image, index) => {
              const linkedColor = product.colors.find((c) => c.id === image.colorId) ?? null;
              return (
                <div key={image.id} className="flex flex-col gap-1.5">
                  <div className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                    <img src={resolveMediaUrl(image.url, 400)} alt="" className="h-full w-full object-cover" />
                    {index === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Principale
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteImage.mutate(image.id)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition group-hover:opacity-100"
                      aria-label="Supprimer l'image"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                  {hasColors && (
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full ring-1 ring-slate-200"
                        style={{ backgroundColor: linkedColor?.hexCode ?? "transparent" }}
                        title={linkedColor ? `Liee a ${linkedColor.label}` : "Aucune couleur liee"}
                      />
                      <select
                        value={image.colorId ?? ""}
                        onChange={(e) => setImageColor.mutate({ imageId: image.id, colorId: e.target.value || null })}
                        disabled={setImageColor.isPending}
                        aria-label="Lier cette image a une couleur"
                        className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 disabled:opacity-50"
                      >
                        <option value="">— Aucune couleur —</option>
                        {product.colors.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-6 text-center transition-colors ${
            isDragging ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
          }`}
        >
          {uploadImages.isPending ? (
            <>
              <Spinner />
              <p className="text-sm text-slate-500">Envoi en cours...</p>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                <IconUpload className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-slate-700">Glissez-deposez des images ici</p>
              <p className="text-xs text-slate-400">ou cliquez pour parcourir &middot; JPG, PNG, WEBP</p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploadImages.isPending}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
      </CardBody>
    </Card>
  );
}
