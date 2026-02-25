import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductAddToCart } from "@/components/product/add-to-cart";
import { ArrowLeft } from "lucide-react";
import { fetchCatalogProductBySlug } from "@/lib/fetch-api";

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  is_active: boolean;
  image_url?: string;
};

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = (await fetchCatalogProductBySlug(params.slug)) as Product | null;

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux produits
      </Link>

      <div className="glass-card overflow-hidden p-8">
        <div className="flex flex-col gap-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/60 bg-white/40">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100/70 to-white/60">
                <span className="text-sm font-semibold text-slate-700">Sélection Ramadan</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
          </div>
          <div className="border-b border-white/50 pb-6">
            <h1 className="page-heading text-slate-900">{product.name}</h1>
            <p className="mt-3 text-slate-600">
              {product.description || "Aucune description disponible pour ce produit."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="text-3xl font-bold text-amber-600">
              {Number(product.price).toFixed(2)} €
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  product.stock > 0
                    ? "bg-emerald-100/80 text-emerald-800"
                    : "bg-red-100/80 text-red-800"
                }`}
              >
                {product.stock > 0 ? `${product.stock} disponible(s)` : "Rupture"}
              </span>
            </div>
          </div>

          <ProductAddToCart
            id={product.id}
            name={product.name}
            price={Number(product.price)}
          />
        </div>
      </div>
    </div>
  );
}
