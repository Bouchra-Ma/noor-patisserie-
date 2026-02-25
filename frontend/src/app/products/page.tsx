import { fetchCatalogProducts } from "@/lib/fetch-api";
import { CategoryCarousel } from "@/components/product/category-carousel";

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  is_active: boolean;
  image_url?: string;
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
  };
};

export default async function ProductsPage() {
  const products = (await fetchCatalogProducts()) as Product[];

  const sections = Array.from(
    products.reduce((acc, product) => {
      const key = product.category?.slug ?? "autres";
      const entry = acc.get(key);
      if (entry) {
        entry.products.push(product);
      } else {
        acc.set(key, { category: product.category, products: [product] });
      }
      return acc;
    }, new Map<string, { category: Product["category"]; products: Product[] }>())
  )
    .map(([, value]) => value)
    .sort((a, b) => {
      const slugA = a.category?.slug ?? "";
      const slugB = b.category?.slug ?? "";
      const order = ["patisseries-feuilletees", "jus-frais", "chocolat"];
      const iA = order.indexOf(slugA);
      const iB = order.indexOf(slugB);
      if (iA !== -1 && iB !== -1) return iA - iB;
      if (iA !== -1) return -1;
      if (iB !== -1) return 1;
      return (a.category?.name ?? "").localeCompare(b.category?.name ?? "");
    });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="page-heading text-slate-900">Catalogue Ramadan</h1>
        <p className="page-subheading">Pâtisseries et traditions du Middle East — prêtes à partager.</p>
      </div>

      {products.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-slate-600">Aucun produit trouvé.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/80 p-4 backdrop-blur-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-800/80">
              Choisis une catégorie
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {sections.map(({ category }) => (
                <a
                  key={category.slug}
                  href={`#${category.slug}`}
                  className="inline-flex items-center rounded-xl border-2 border-amber-400/70 bg-white px-5 py-2.5 text-sm font-semibold text-amber-900 shadow-sm transition hover:border-amber-500 hover:bg-amber-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                >
                  {category.name}
                </a>
              ))}
            </div>
          </div>

          {sections.map(({ category, products: categoryProducts }) => (
            <section
              key={category.slug}
              id={category.slug}
              className="scroll-mt-28 flex flex-col gap-4"
            >
              <header className="flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {category.name}
                </h2>
              </header>

              <CategoryCarousel products={categoryProducts} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
