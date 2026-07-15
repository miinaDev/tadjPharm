import { Link } from "react-router-dom";
import type { Category } from "../../types";

interface CategoryFilterBarProps {
  categories: Category[];
  activeSlug?: string;
}

// Meme cible que le bouton "Voir nos produits" du hero : on defile jusqu'au catalogue.
function scrollToCatalogue() {
  // Double rAF : on laisse la nouvelle route se rendre (le hero peut apparaitre/disparaitre) avant de defiler.
  requestAnimationFrame(() =>
    requestAnimationFrame(() =>
      document.getElementById("catalogue")?.scrollIntoView({ behavior: "auto", block: "start" })
    )
  );
}

// Meme pastille que la barre de sous-categories : actif = bleu plein, sinon blanc a liseré.
function Tab({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      onClick={scrollToCatalogue}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25"
          : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-slate-800"
      }`}
    >
      {label}
    </Link>
  );
}

export function CategoryFilterBar({ categories, activeSlug }: CategoryFilterBarProps) {
  return (
    <div className="-mx-4 mb-2 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
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
