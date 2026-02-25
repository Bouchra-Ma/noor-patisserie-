"use client";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
      <p className="text-sm font-medium text-slate-600">Chargement...</p>
    </div>
  );
}
