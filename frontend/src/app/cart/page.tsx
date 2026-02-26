"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { ShoppingBag, Trash2 } from "lucide-react";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleCheckout() {
    if (!isMounted || !isHydrated || !user) {
      router.push("/login");
      return;
    }

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const successBase = origin ? `${origin.replace(/\/$/, "")}/success` : "";
      const url = successBase
        ? `/payments/create-checkout-session/?success_url=${encodeURIComponent(successBase)}`
        : "/payments/create-checkout-session/";
      const res = await api.post(url, { items });
      if (!res.ok) {
        console.error("Checkout creation failed", await res.text());
        return;
      }
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="page-heading text-slate-900">Panier</h1>
        <p className="page-subheading">
          Récapitulatif de tes articles avant le paiement.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center gap-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 text-slate-300" />
          <p className="text-slate-600">Ton panier est vide pour le moment.</p>
          <Button variant="secondary" asChild>
            <Link href="/products">Voir les produits</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="glass-card flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{item.name}</span>
                    <span className="text-sm text-slate-600">
                      {item.quantity} × {item.price.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => addItem({ id: item.id, name: item.name, price: item.price }, 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-900">
                    {(item.price * item.quantity).toFixed(2)} €
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(item.id)}
                    className="text-slate-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card flex items-center justify-between border-t border-white/50 p-5">
            <span className="font-medium text-slate-700">Total TTC</span>
            <span className="text-2xl font-bold text-amber-600">{total.toFixed(2)} €</span>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="w-full" size="lg" onClick={handleCheckout}>
              Passer au paiement
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => clear()}>
              Vider le panier
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
