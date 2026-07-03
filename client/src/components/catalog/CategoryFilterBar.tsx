import { Link } from "react-router-dom";
import type { Category } from "../../types";

interface CategoryFilterBarProps {
  categories: Category[];
  activeSlug?: string;
}

function Tab({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`relative shrink-0 pb-1 text-[15px] font-medium transition ${
        active ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {label}
      {active && <span className="absolute -right-2 top-0 h-1.5 w-1.5 rounded-full bg-brand-500" />}
    </Link>
  );
}

export function CategoryFilterBar({ categories, activeSlug }: CategoryFilterBarProps) {
  return (
    <div className="-mx-4 mb-2 flex items-center gap-6 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <Tab to="/" label="Tous" active={!activeSlug} />
      {categories.map((category) => (
        <Tab
          key={category.id}
          to={`/categorie/${category.slug}`}
          label={category.name}
          active={activeSlug === category.slug}
        />
      ))}
    </div>
  );
}
