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
import { IconChevronLeft, IconChevronRight } from "../../components/ui/icons";

const PAGE_SIZE = 50;

export function CatalogPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
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

  // On garde le champ de saisie synchronise avec la page courante (navigation par boutons, reset de filtre...).
  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  function goToPage(next: number) {
    const clamped = Math.min(totalPages, Math.max(1, next));
    setPage(clamped);
    document.getElementById("catalogue")?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  // Valide le numero saisi : on borne entre 1 et le nombre de pages, sinon on restaure la page actuelle.
  function commitPageInput() {
    const parsed = parseInt(pageInput, 10);
    if (Number.isNaN(parsed)) {
      setPageInput(String(page));
      return;
    }
    const clamped = Math.min(totalPages, Math.max(1, parsed));
    if (clamped === page) setPageInput(String(page));
    else goToPage(clamped);
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
            emptyTitle={isSearching ? "Aucun résultat" : undefined}
            emptyDescription={
              isSearching ? `Aucun produit ne correspond à « ${debouncedSearch} ». Essayez un autre terme.` : undefined
            }
          />
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm sm:flex-row">
              <p className="text-slate-500">
                {total} produit{total > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  <IconChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>

                <div className="flex items-center gap-1.5 px-1 text-slate-600">
                  <span>Page</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={commitPageInput}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitPageInput();
                        e.currentTarget.blur();
                      }
                    }}
                    aria-label="Numéro de page"
                    className="h-8 w-14 rounded-lg border border-slate-200 bg-white px-2 text-center text-sm font-medium text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span>sur {totalPages}</span>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Suivant
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
