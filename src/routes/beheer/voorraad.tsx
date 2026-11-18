import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageOff, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminPage, adminBtn, ErrorNote, Loading } from "@/components/admin/ui";
import { errorMessage, listAdminProducts, LOW_STOCK, updateProductFields } from "@/lib/admin/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/beheer/voorraad")({
  component: Voorraad,
});

function Voorraad() {
  const qc = useQueryClient();
  const products = useQuery({ queryKey: ["admin", "products"], queryFn: listAdminProducts });
  // Gewijzigde aantallen die nog niet zijn opgeslagen, per product-id.
  const [draft, setDraft] = useState<Record<string, number>>({});

  const save = useMutation({
    mutationFn: async (changes: [string, number][]) => {
      for (const [id, stock] of changes) await updateProductFields(id, { stock });
    },
    onSuccess: async (_, changes) => {
      setDraft({});
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin"] }),
        qc.invalidateQueries({ queryKey: ["catalog"] }),
      ]);
      toast.success(
        changes.length === 1 ? "Voorraad bijgewerkt" : `${changes.length} producten bijgewerkt`,
      );
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const changes = Object.entries(draft).filter(
    ([id, value]) => products.data?.find((p) => p.id === id)?.stock !== value,
  );

  function setValue(id: string, value: number) {
    setDraft((d) => ({ ...d, [id]: Math.max(0, Math.min(99999, Math.floor(value) || 0)) }));
  }

  return (
    <AdminPage
      title="Voorraad"
      description="Hoeveel stuks er van elk product klaarliggen. Bij 0 staat het product op de website als uitverkocht. Nieuwe producten verschijnen hier vanzelf."
      actions={
        <button
          type="button"
          className={adminBtn.primary}
          disabled={changes.length === 0 || save.isPending}
          onClick={() => save.mutate(changes)}
        >
          {save.isPending
            ? "Opslaan…"
            : changes.length
              ? `${changes.length} wijziging(en) opslaan`
              : "Opgeslagen"}
        </button>
      }
    >
      {products.isPending ? (
        <Loading />
      ) : products.error ? (
        <ErrorNote>{errorMessage(products.error)}</ErrorNote>
      ) : products.data.length === 0 ? (
        <p className="border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Nog geen producten.{" "}
          <Link to="/beheer/producten" className="underline">
            Voeg een product toe
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border bg-card">
          {products.data.map((p) => {
            const value = draft[p.id] ?? p.stock;
            const changed = value !== p.stock;
            const status =
              value <= 0
                ? { label: "Uitverkocht", cls: "bg-ink text-white" }
                : value <= LOW_STOCK
                  ? { label: "Bijna op", cls: "bg-calendula/30 text-ink" }
                  : { label: "Op voorraad", cls: "bg-cream text-ink" };
            const image = p.images[0]?.url;
            return (
              <li
                key={p.id}
                className={cn(
                  "flex flex-wrap items-center gap-4 px-4 py-3",
                  changed && "bg-calendula/10",
                )}
              >
                <div className="size-14 shrink-0 overflow-hidden bg-cream">
                  {image ? (
                    <img src={image} alt="" className="size-full object-cover" />
                  ) : (
                    <ImageOff className="m-auto mt-4 size-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/beheer/producten/$id"
                    params={{ id: p.id }}
                    className="font-semibold hover:underline"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {p.size ? `${p.size} · ` : ""}
                    {p.is_visible ? "Zichtbaar op de website" : "Verborgen"}
                  </p>
                </div>
                <span className={cn("px-2.5 py-1 text-xs font-semibold", status.cls)}>
                  {status.label}
                </span>
                <div className="flex items-center border border-ink bg-white">
                  <button
                    type="button"
                    aria-label={`Eén minder ${p.name}`}
                    onClick={() => setValue(p.id, value - 1)}
                    disabled={value <= 0}
                    className="px-3 py-2 disabled:opacity-30"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    aria-label={`Voorraad ${p.name}`}
                    value={value}
                    onChange={(e) => setValue(p.id, Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && changes.length) save.mutate(changes);
                    }}
                    className="w-20 border-x border-ink py-2 text-center text-base font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    aria-label={`Eén meer ${p.name}`}
                    onClick={() => setValue(p.id, value + 1)}
                    className="px-3 py-2"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-sm text-muted-foreground">
        Bij een bestelling gaat de voorraad automatisch omlaag; bij annuleren gaat hij weer omhoog.
      </p>
    </AdminPage>
  );
}
