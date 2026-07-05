import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCategories, useProducts } from "../../hooks/useCatalog";
import { Hero } from "../../components/catalog/Hero";
import { CategoryFilterBar } from "../../components/catalog/CategoryFilterBar";
import { SubcategoryFilterBar } from "../../components/catalog/SubcategoryFilterBar";
import { CatalogSearch } from "../../components/catalog/CatalogSearch";
import { ProductGrid } from "../../components/catalog/ProductGrid";
import { Spinner } from "../../components/common/Spinner";

export function CatalogPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const { data: categories } = useCategories();

  // On temporise la saisie pour ne pas requeter a chaque frappe.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Changer de categorie remet la sous-categorie a zero.
  useEffect(() => {
    setActiveSub(null);
  }, [slug]);

  const activeCategory = categories?.find((c) => c.slug === slug);
  const subcategories = activeCategory?.subcategories ?? [];

  const { data: products, isLoading } = useProducts({
    categorySlug: slug,
    subcategorySlug: activeSub ?? undefined,
    search: debouncedSearch || undefined,
  });

  const isSearching = debouncedSearch.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {!slug && <Hero />}
      <div id="catalogue" className="scroll-mt-24" />
      <CatalogSearch value={search} onChange={setSearch} />
      <CategoryFilterBar categories={categories ?? []} activeSlug={slug} />
      {slug && subcategories.length > 0 && (
        <SubcategoryFilterBar subcategories={subcategories} activeSlug={activeSub} onSelect={setActiveSub} />
      )}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <ProductGrid
          products={products ?? []}
          emptyTitle={isSearching ? "Aucun resultat" : undefined}
          emptyDescription={
            isSearching ? `Aucun produit ne correspond a "${debouncedSearch}". Essayez un autre terme.` : undefined
          }
        />
      )}
    </div>
  );
}
