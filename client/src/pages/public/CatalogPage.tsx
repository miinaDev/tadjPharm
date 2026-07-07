import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCategories, useProducts } from "../../hooks/useCatalog";
import { Hero } from "../../components/catalog/Hero";
import { CategoryFilterBar } from "../../components/catalog/CategoryFilterBar";
import { SubcategoryFilterBar } from "../../components/catalog/SubcategoryFilterBar";
import { CatalogSearch } from "../../components/catalog/CatalogSearch";
import { ProductGrid } from "../../components/catalog/ProductGrid";
import { Spinner } from "../../components/common/Spinner";
import { Button } from "../../components/ui/Button";

const PAGE_SIZE = 50;

export function CatalogPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [page, setPage] = useState(1);
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

  // Tout changement de filtre ou de recherche ramene a la premiere page.
  useEffect(() => {
    setPage(1);
  }, [slug, activeSub, debouncedSearch]);

  const { data, isLoading } = useProducts({
    categorySlug: slug,
    subcategorySlug: activeSub ?? undefined,
    search: debouncedSearch || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const isSearching = debouncedSearch.length > 0;

  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function goToPage(next: number) {
    setPage(next);
    document.getElementById("catalogue")?.scrollIntoView({ behavior: "auto", block: "start" });
  }

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
        <>
          <ProductGrid
            products={products}
            emptyTitle={isSearching ? "Aucun resultat" : undefined}
            emptyDescription={
              isSearching ? `Aucun produit ne correspond a "${debouncedSearch}". Essayez un autre terme.` : undefined
            }
          />
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm sm:flex-row">
              <p className="text-slate-500">
                Page {page} sur {totalPages} · {total} produit{total > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => goToPage(Math.max(1, page - 1))}
                >
                  Precedent
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
