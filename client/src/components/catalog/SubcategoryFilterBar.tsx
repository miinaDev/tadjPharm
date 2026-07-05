import type { Subcategory } from "../../types";

interface SubcategoryFilterBarProps {
  subcategories: Subcategory[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

export function SubcategoryFilterBar({ subcategories, activeSlug, onSelect }: SubcategoryFilterBarProps) {
  if (subcategories.length === 0) return null;
  return (
    <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <Chip label="Tous" active={!activeSlug} onClick={() => onSelect(null)} />
      {subcategories.map((sub) => (
        <Chip key={sub.id} label={sub.name} active={activeSlug === sub.slug} onClick={() => onSelect(sub.slug)} />
      ))}
    </div>
  );
}
