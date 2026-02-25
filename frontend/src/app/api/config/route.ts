import { NextResponse } from "next/server";

/**
 * Expose l'URL de l'API backend au client.
 * Sur Vercel, la variable est lue au runtime (pas seulement au build),
 * donc pas besoin de redéployer pour changer l'URL.
 */
export async function GET() {
  const apiBaseUrl = (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000/api"
  ).replace(/\/$/, "");
  return NextResponse.json({ apiBaseUrl });
}
