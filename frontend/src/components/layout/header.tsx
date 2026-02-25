"use client";

import Link from "next/link";
import { ShoppingBag, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 backdrop-blur-xl bg-white/70 shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-white shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/40 transition-shadow">
            N
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Noor Pâtisserie
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/products"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white/60 hover:text-slate-900 transition-colors"
          >
            Produits
          </Link>
          <Link
            href="/orders"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white/60 hover:text-slate-900 transition-colors"
          >
            Mes commandes
          </Link>
          <Link
            href="/contact"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white/60 hover:text-slate-900 transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isMounted && isHydrated && user ? (
            <>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white/50">
                <User className="h-3.5 w-3.5" />
                {user.first_name?.trim() ? user.first_name : "Mon compte"}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
          )}
          <Button size="sm" variant="primary" asChild className="gap-2">
            <Link href="/cart">
              <span className="relative inline-flex">
                <ShoppingBag className="h-4 w-4" />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {count}
                  </span>
                )}
              </span>
              Panier
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
