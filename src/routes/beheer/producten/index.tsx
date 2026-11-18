import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImageOff, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { AdminPage, adminBtn, ErrorNote, Loading } from "@/components/admin/ui";
import { Switch } from "@/components/ui/switch";
import {
  errorMessage,
  listAdminProducts,
  reorderProducts,
  updateProductFields,
} from "@/lib/admin/api";
import type { DbProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/beheer/producten/")({
  component: Producten,
});

function Producten() {
  const qc = useQueryClient();
  const key = ["admin", "products"];
  const products = useQuery({ queryKey: key, queryFn: listAdminProducts });

  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["admin"] }),
      qc.invalidateQueries({ queryKey: ["catalog"] }),
    ]);

  const reorder = useMutation({
    mutationFn: reorderProducts,
    onMutate: async (ids) => {
      // Direct tonen, daarna bevestigen met de database.
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<DbProduct[]>(key);
      if (previous) {
        qc.setQueryData(key, ids.map((id) => previous.find((p) => p.id === id)).filter(Boolean));
      }
      return { previous };
    },
    onError: (err, _ids, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
      toast.error(errorMessage(err));
    },
    onSettled: refresh,
  });

  const visibility = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      updateProductFields(id, { is_visible: visible }),
    onSuccess: async (_, { visible }) => {
      await refresh();
      toast.success(visible ? "Product staat op de website" : "Product is verborgen");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  function move(index: number, delta: number) {
    const list = products.data;
    if (!list) return;
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const ids = list.map((p) => p.id);
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    reorder.mutate(ids);
  }

  return (
    <AdminPage
      title="Producten"
      description="Voeg producten toe, wijzig ze of haal ze van de website. Met de pijltjes bepaal je de volgorde in de shop en op de homepage."
      actions={
        <Link to="/beheer/producten/$id" params={{ id: "nieuw" }} className={adminBtn.primary}>
          <Plus className="size-4" /> Nieuw product
        </Link>
      }
    >
      {products.isPending ? (
        <Loading />
      ) : products.error ? (
        <ErrorNote>{errorMessage(products.error)}</ErrorNote>
      ) : products.data.length === 0 ? (
        <p className="border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Nog geen producten.
        </p>
      ) : (
        <ol className="divide-y divide-border border border-border bg-card">
          {products.data.map((p, i) => {
            const image = p.images[0]?.url;
            return (
              <li
                key={p.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4",
                  !p.is_visible && "bg-muted/40",
                )}
              >
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label={`${p.name} omhoog`}
                    disabled={i === 0 || reorder.isPending}
                    onClick={() => move(i, -1)}
                    className="p-1 hover:bg-cream disabled:opacity-20"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`${p.name} omlaag`}
                    disabled={i === products.data.length - 1 || reorder.isPending}
                    onClick={() => move(i, 1)}
                    className="p-1 hover:bg-cream disabled:opacity-20"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
                <span className="w-5 text-center text-sm text-muted-foreground">{i + 1}</span>
                <div className="size-16 shrink-0 overflow-hidden bg-cream">
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      className={cn("size-full object-cover", !p.is_visible && "opacity-50")}
                    />
                  ) : (
                    <ImageOff className="m-auto mt-5 size-5 text-muted-foreground" />
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
                  <p className="truncate text-sm text-muted-foreground">
                    {formatPrice(p.price_cents)}
                    {p.size ? ` · ${p.size}` : ""} · voorraad {p.stock}
                    {p.is_example ? " · voorbeeldproduct" : ""}
                  </p>
                  {p.images.length === 0 && (
                    <p className="text-xs font-medium text-brand-deep">
                      Nog geen foto: kan niet online
                    </p>
                  )}
                </div>
                <label className="hidden items-center gap-2 text-sm sm:flex">
                  {p.is_visible ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4 text-muted-foreground" />
                  )}
                  <span className="w-16">{p.is_visible ? "Online" : "Verborgen"}</span>
                  <Switch
                    checked={p.is_visible}
                    disabled={visibility.isPending || (!p.is_visible && p.images.length === 0)}
                    onCheckedChange={(visible) => visibility.mutate({ id: p.id, visible })}
                    aria-label={`${p.name} op de website tonen`}
                  />
                </label>
                <Link
                  to="/beheer/producten/$id"
                  params={{ id: p.id }}
                  className={adminBtn.ghost}
                  aria-label={`${p.name} bewerken`}
                >
                  <Pencil className="size-4" />
                  <span className="hidden md:inline">Bewerken</span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </AdminPage>
  );
}
