"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

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
  pending: "En attente de paiement",
  paid: "Payé",
  cancelled: "Annulé",
  refunded: "Remboursé",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchOrders() {
      try {
        const res = await api.get("/orders/");
        if (!res.ok) {
          setError("Impossible de charger les commandes.");
          return;
        }
        const data = await res.json();
        setOrders(data);
      } catch {
        setError("Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [isHydrated, user, router]);

  if (!isHydrated || !user) return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="page-heading text-slate-900">Mes commandes</h1>
        <p className="page-subheading">Historique de tes commandes et suivi du statut.</p>
      </div>

      {loading ? (
        <div className="glass-card flex items-center justify-center py-12">
          <p className="text-slate-600">Chargement...</p>
        </div>
      ) : error ? (
        <div className="glass-card rounded-xl bg-red-50/80 p-4">
          <p className="text-sm text-red-600" role="alert">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-5 py-16 text-center">
          <Package className="h-14 w-14 text-slate-300" />
          <p className="text-slate-600">Tu n&apos;as pas encore de commande.</p>
          <Button asChild>
            <Link href="/products">Voir les produits</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <article key={order.id} className="glass-card flex flex-col gap-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/50 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">Commande #{order.id}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      order.status === "paid"
                        ? "bg-emerald-100/80 text-emerald-800"
                        : order.status === "pending"
                          ? "bg-amber-100/80 text-amber-800"
                          : "bg-slate-100/80 text-slate-700"
                    }`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <span className="text-sm text-slate-500">
                  {new Date(order.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <ul className="flex flex-col gap-1.5 text-sm text-slate-600">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>{(Number(item.price) * item.quantity).toFixed(2)} €</span>
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
          ))}
        </div>
      )}
    </div>
  );
}
