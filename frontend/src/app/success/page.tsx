"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Package } from "lucide-react";

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  price: string;
};

type Order = {
  id: number;
  status: string;
  total_amount: string;
  created_at: string;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente de confirmation",
  paid: "Payé",
  cancelled: "Annulé",
  refunded: "Remboursé",
};

export default function SuccessPage() {
  const params = useSearchParams();
  const router = useRouter();

  const orderId = useMemo(() => {
    const raw = params.get("order_id");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const sessionId = useMemo(() => {
    const raw = params.get("session_id");
    return raw && raw.trim().length > 0 ? raw.trim() : null;
  }, [params]);

  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const clearCart = useCartStore((s) => s.clear);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectChecked, setRedirectChecked] = useState(false);

  // Attendre la réhydratation (localStorage) avant de considérer une redirection vers login.
  // Après un retour Stripe, le store peut être vide au premier rendu puis restauré.
  useEffect(() => {
    if (!isHydrated) return;
    const t = setTimeout(() => {
      setRedirectChecked(true);
    }, 400);
    return () => clearTimeout(t);
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || !redirectChecked) return;
    if (!orderId && !sessionId) {
      setError("Commande introuvable (order_id ou session_id manquant).");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let tries = 0;
    const maxTries = 20;

    async function run() {
      // 1) Si on a session_id (retour Stripe mobile / autre onglet), essayer l’endpoint public sans auth
      if (sessionId) {
        try {
          const res = await api.get(
            `/orders/by-checkout-session/?session_id=${encodeURIComponent(sessionId)}`,
            { requiresAuth: false }
          );
          if (cancelled) return;
          if (res.ok) {
            const data = (await res.json()) as Order;
            setOrder(data);
            if (data.status === "paid") clearCart();
            setLoading(false);
            if (data.status === "pending") {
              const poll = async () => {
                if (cancelled) return;
                try {
                  const r = await api.get(
                    `/orders/by-checkout-session/?session_id=${encodeURIComponent(sessionId)}`,
                    { requiresAuth: false }
                  );
                  if (cancelled || !r.ok) return;
                  const d = (await r.json()) as Order;
                  setOrder(d);
                  if (d.status === "paid") clearCart();
                  if (d.status === "pending" && !cancelled) setTimeout(poll, 2000);
                } catch {
                  // ignore
                }
              };
              setTimeout(poll, 2000);
            }
            return;
          }
        } catch {
          if (!cancelled) {
            setError("Impossible de charger la commande.");
            setLoading(false);
          }
        }
        if (cancelled) return;
        // Public fetch a échoué, on continue avec le flux auth si pas d’utilisateur → login
      }

      // 2) Pas de session_id ou endpoint public en échec : il faut être connecté
      if (!user) {
        router.push("/login");
        return;
      }
      if (!orderId) {
        setError("Commande introuvable (order_id manquant).");
        setLoading(false);
        return;
      }

      // 3) Récupérer la commande avec auth (flux classique)
      async function fetchOrder() {
        tries += 1;
        try {
          if (sessionId) {
            await api.post("/payments/confirm-checkout-session/", { session_id: sessionId });
          }
          const res = await api.get(`/orders/${orderId}/`);
          if (!res.ok) {
            if (!cancelled) setError("Impossible de charger la commande.");
            return;
          }
          const data = (await res.json()) as Order;
          if (cancelled) return;
          setOrder(data);
          if (data.status === "paid") clearCart();
          if (data.status === "pending" && tries < maxTries) {
            setTimeout(fetchOrder, 2000);
          }
        } catch {
          if (!cancelled) setError("Une erreur est survenue.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
      fetchOrder();
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [isHydrated, redirectChecked, user, router, orderId, sessionId, clearCart]);

  // Chargement tant qu’on n’a pas vérifié la session (évite redirection login trop tôt)
  if (!isHydrated || (!redirectChecked && !user)) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="glass-card flex items-center justify-center gap-3 py-12">
          <Clock className="h-5 w-5 animate-pulse text-amber-500" />
          <p className="text-slate-600">Chargement…</p>
        </div>
      </div>
    );
  }
  // Rediriger vers login seulement si pas d’utilisateur ET pas de commande (ex. pas de session_id)
  if (!user && !order) return null;

  const paid = order?.status === "paid";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="page-heading text-slate-900">Paiement</h1>
        <p className="page-subheading">
          {paid
            ? "Merci ! Ton paiement a été confirmé."
            : "Ton paiement est en cours de confirmation (quelques secondes)."}
        </p>
      </div>

      {loading ? (
        <div className="glass-card flex items-center justify-center gap-3 py-12">
          <Clock className="h-5 w-5 text-amber-500" />
          <p className="text-slate-600">Chargement de la commande…</p>
        </div>
      ) : error ? (
        <div className="glass-card rounded-xl bg-red-50/80 p-4">
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
          <div className="mt-3 flex gap-2">
            <Button asChild>
              <Link href="/orders">Mes commandes</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/products">Retour aux produits</Link>
            </Button>
          </div>
        </div>
      ) : !order ? (
        <div className="glass-card flex flex-col items-center gap-4 py-16 text-center">
          <Package className="h-14 w-14 text-slate-300" />
          <p className="text-slate-600">Commande introuvable.</p>
          <Button asChild>
            <Link href="/orders">Mes commandes</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="glass-card flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-3">
              {paid ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <Clock className="h-6 w-6 text-amber-500" />
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900">
                  Commande #{order.id}
                </span>
                <span className="text-sm text-slate-600">
                  Statut : {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
            </div>
            <span className="text-sm text-slate-500">
              {new Date(order.created_at).toLocaleString("fr-FR")}
            </span>
          </div>

          <article className="glass-card flex flex-col gap-4 p-5">
            <h2 className="section-title">Produits</h2>
            <ul className="flex flex-col gap-1.5 text-sm text-slate-600">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span className="min-w-0 truncate">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="shrink-0">
                    {(Number(item.price) * item.quantity).toFixed(2)} €
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-white/50 pt-4 text-sm">
              <span className="font-medium text-slate-700">Total</span>
              <span className="font-bold text-amber-600">
                {Number(order.total_amount).toFixed(2)} €
              </span>
            </div>
          </article>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="sm:flex-1" asChild>
              <Link href="/orders">Voir mes commandes</Link>
            </Button>
            <Button className="sm:flex-1" variant="secondary" asChild>
              <Link href="/products">Continuer mes achats</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

