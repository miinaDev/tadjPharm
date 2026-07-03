import { useEffect, useRef, useState, type DragEvent } from "react";
import { IconImage, IconTrash, IconUpload } from "../ui/icons";

interface ImagePickerProps {
  files: File[];
  onChange: (files: File[]) => void;
}

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function ImagePicker({ files, onChange }: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const accepted = Array.from(list).filter((f) => ACCEPTED_TYPES.has(f.type));
    if (accepted.length > 0) onChange([...files, ...accepted]);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          isDragging ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
        }`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
          <IconUpload className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-slate-700">Glissez-deposez vos images ici</p>
        <p className="text-xs text-slate-400">ou cliquez pour parcourir &middot; JPG, PNG, WEBP</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
      />

      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {previews.map((url, index) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img src={url} alt="" className="h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Principale
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAt(index);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Retirer l'image"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length === 0 && (
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <IconImage className="h-3.5 w-3.5" /> Aucune image selectionnee pour le moment
        </p>
      )}
    </div>
  );
}
