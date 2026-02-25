import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <FileQuestion className="h-20 w-20 text-slate-300" />
      <div className="flex flex-col gap-2">
        <h1 className="page-heading text-slate-900">Page introuvable</h1>
        <p className="page-subheading max-w-md">
          La page que tu cherches n’existe pas ou a été déplacée.
        </p>
      </div>
      <Button size="lg" asChild>
        <Link href="/">Retour à l’accueil</Link>
      </Button>
    </div>
  );
}
