"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<null | "idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col gap-2">
        <h1 className="page-heading text-slate-900">Contact</h1>
        <p className="page-subheading">Une question ? Envoie-nous un message.</p>
      </div>

      <div className="mt-8">
        <form className="glass-card flex flex-col gap-5 p-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="label">Nom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
              placeholder="Ton nom"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              placeholder="ton@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="input resize-none"
              required
              placeholder="Ton message..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg" disabled={status === "sending"} className="gap-2">
              {status === "sending" ? "Envoi..." : "Envoyer"}
              {status !== "sending" && <Send className="h-4 w-4" />}
            </Button>
            {status === "sent" && (
              <span className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                Message envoyé. Merci !
              </span>
            )}
            {status === "error" && (
              <span className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                Erreur lors de l&apos;envoi.
              </span>
            )}
          </div>
        </form>

        <section className="glass-card mt-6 p-5">
          <h2 className="section-title mb-2 flex items-center gap-2">
            <Mail className="h-5 w-5 text-amber-600" />
            Contact alternatif
          </h2>
          <p className="text-sm text-slate-600">
            Tu peux aussi nous écrire à :{" "}
            <a
              href="mailto:contact@example.com"
              className="font-medium text-amber-700 underline-offset-2 hover:underline"
            >
              contact@example.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
