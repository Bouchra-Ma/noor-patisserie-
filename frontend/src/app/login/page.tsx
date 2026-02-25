"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login/", { email, password }, { requiresAuth: false });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg =
          (typeof errData?.detail === "string" ? errData.detail : null) ||
          errData?.detail?.message ||
          "Email ou mot de passe incorrect.";
        setError(msg);
        return;
      }
      const data = await res.json();
      setAuth(data);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Erreur réseau ou CORS. Vérifie que le backend Render est en ligne et que l’URL Vercel est dans CORS.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="glass-card p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="page-heading text-2xl md:text-3xl text-slate-900">Connexion</h1>
            <p className="page-subheading">
              Connecte-toi pour accéder à ton compte et suivre tes commandes.
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="ton.email@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="label">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-semibold text-amber-700 underline-offset-2 hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
