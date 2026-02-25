"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { ProductAddToCart } from "./add-to-cart";

const SCROLL_STEP_PX = 2;
const SCROLL_TICK_MS = 20;

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  image_url?: string;
  category: { id: number; name: string; slug: string; description: string };
};

export function CategoryCarousel({
  products,
}: {
  products: Product[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startScroll = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      let next = el.scrollLeft + SCROLL_STEP_PX;
      if (next >= maxScroll) next = 0;
      el.scrollLeft = next;
    }, SCROLL_TICK_MS);
  }, []);

  const stopScroll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPaused) {
      stopScroll();
    } else {
      startScroll();
    }
    return () => stopScroll();
  }, [isPaused, startScroll, stopScroll]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div
      ref={scrollRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max gap-4">
        {products.map((product) => (
          <article
            key={product.id}
            className="glass-card-hover w-[260px] shrink-0 p-4 sm:w-[300px]"
          >
            <Link href={`/products/${product.slug}`} className="block group">
              <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/60 bg-white/40">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100/70 to-white/60">
                    <span className="text-sm font-semibold text-slate-700">
                      Sélection Ramadan
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
              </div>
              <h3 className="font-semibold text-slate-900 transition-colors group-hover:text-amber-700">
                {product.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                {product.description}
              </p>
            </Link>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/50 pt-3">
              <span className="text-base font-bold text-amber-600">
                {Number(product.price).toFixed(2)} €
              </span>
              <span className="rounded-full bg-white/60 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                Stock : {product.stock}
              </span>
            </div>

            <div className="mt-3">
              <ProductAddToCart
                id={product.id}
                name={product.name}
                price={Number(product.price)}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
