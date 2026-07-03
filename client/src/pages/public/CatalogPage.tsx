import { useParams } from "react-router-dom";
import { useCategories, useProducts } from "../../hooks/useCatalog";
import { Hero } from "../../components/catalog/Hero";
import { CategoryFilterBar } from "../../components/catalog/CategoryFilterBar";
import { ProductGrid } from "../../components/catalog/ProductGrid";
import { Spinner } from "../../components/common/Spinner";

export function CatalogPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({ categorySlug: slug });

  return (
    <div className="flex flex-col gap-4">
      {!slug && <Hero />}
      <div id="catalogue" className="scroll-mt-24" />
      <CategoryFilterBar categories={categories ?? []} activeSlug={slug} />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <ProductGrid products={products ?? []} />
      )}
    </div>
  );
}
