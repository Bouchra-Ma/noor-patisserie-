import Link from "next/link";
import { fetchCatalogProducts } from "@/lib/fetch-api";
import { Button } from "@/components/ui/button";

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

export default async function Home() {
  const products = (await fetchCatalogProducts()) as Product[];

  return (
    <div className="flex w-full flex-col gap-10">
      <section className="glass-card overflow-hidden p-6 md:p-8">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Ramadan Mubarak
            </div>
            <h1 className="page-heading bg-gradient-to-r from-slate-900 via-slate-800 to-amber-900 bg-clip-text text-transparent">
              Douceurs de Ramadan, esprit du Moyen‑Orient
            </h1>
            <p className="text-base text-slate-600">
              Baklawa, kunafa au fromage, maamoul, dattes premium… une sélection chaleureuse pour l’iftar, le suhoor et les cadeaux.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/products">Voir le catalogue</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/contact">Commander pour un événement</Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/60 bg-white/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.pexels.com/photos/7129411/pexels-photo-7129411.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Pâtisseries de Ramadan — ambiance Noor"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/35 via-black/0 to-black/0" />
          </div>
        </div>
      </section>

      {products.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-slate-600">
            Aucun produit pour le moment. Vérifie que le serveur Django tourne et que l’API retourne des données.
          </p>
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="block group">
              <article className="glass-card-hover flex h-full flex-col justify-between p-5">
                <div className="flex flex-col gap-3">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/60 bg-white/40">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100/70 to-white/60">
                        <span className="text-sm font-semibold text-slate-700">Sélection Ramadan</span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
                  </div>
                  <h2 className="section-title group-hover:text-amber-700 transition-colors">
                    {product.name}
                  </h2>
                  <p className="line-clamp-3 text-sm text-slate-600">
                    {product.description}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/50 pt-4">
                  <span className="text-lg font-bold text-amber-600">
                    {Number(product.price).toFixed(2)} €
                  </span>
                  <span className="rounded-full bg-white/60 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    Stock : {product.stock}
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
