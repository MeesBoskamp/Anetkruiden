import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { NewOrderDialog } from "@/components/admin/NewOrderDialog";
import {
  AdminPage,
  adminBtn,
  ErrorNote,
  inputClass,
  Loading,
  StatusBadge,
} from "@/components/admin/ui";
import {
  errorMessage,
  formatDateTime,
  listOrders,
  ORDER_STATUSES,
  STATUS_LABEL,
  TO_SHIP,
  type OrderStatus,
} from "@/lib/admin/api";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/beheer/bestellingen/")({
  component: Bestellingen,
});

type Filter = "te-verzenden" | "alle" | OrderStatus;

function Bestellingen() {
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: listOrders });
  const [filter, setFilter] = useState<Filter>("te-verzenden");
  const [search, setSearch] = useState("");
  const [showTests, setShowTests] = useState(true);
  const [newOpen, setNewOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { alle: 0, "te-verzenden": 0 };
    for (const o of orders.data ?? []) {
      if (!showTests && o.is_test) continue;
      c["alle"] = (c["alle"] ?? 0) + 1;
      c[o.status] = (c[o.status] ?? 0) + 1;
      if (TO_SHIP.includes(o.status)) c["te-verzenden"] = (c["te-verzenden"] ?? 0) + 1;
    }
    return c;
  }, [orders.data, showTests]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (orders.data ?? []).filter((o) => {
      if (!showTests && o.is_test) return false;
      if (filter === "te-verzenden" && !TO_SHIP.includes(o.status)) return false;
      if (filter !== "alle" && filter !== "te-verzenden" && o.status !== filter) return false;
      if (!q) return true;
      return [
        String(o.order_number),
        o.first_name,
        o.last_name,
        `${o.first_name} ${o.last_name}`,
        o.email,
        o.city,
        o.postal_code,
      ].some((v) => v.toLowerCase().includes(q));
    });
  }, [orders.data, filter, search, showTests]);

  const filters: { id: Filter; label: string }[] = [
    { id: "te-verzenden", label: "Te verzenden" },
    { id: "alle", label: "Alle" },
    ...ORDER_STATUSES.map((s) => ({ id: s, label: STATUS_LABEL[s] })),
  ];

  return (
    <AdminPage
      title="Bestellingen"
      description="Alle bestellingen met klantgegevens en status. Klik op een bestelling om de status te wijzigen."
      actions={
        <button type="button" className={adminBtn.primary} onClick={() => setNewOpen(true)}>
          <Plus className="size-4" /> Bestelling toevoegen
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Filter op status">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "border px-3 py-1.5 text-sm font-semibold",
              filter === f.id
                ? "border-ink bg-ink text-white"
                : "border-border bg-card hover:border-ink",
            )}
          >
            {f.label}
            <span
              className={cn(
                "ml-1.5 text-xs",
                filter === f.id ? "text-white/70" : "text-muted-foreground",
              )}
            >
              {counts[f.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op naam, e-mail, plaats of nummer"
            aria-label="Zoeken"
            className={`${inputClass} pl-9`}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showTests}
            onChange={(e) => setShowTests(e.target.checked)}
          />
          Testbestellingen tonen
        </label>
      </div>

      {orders.isPending ? (
        <Loading />
      ) : orders.error ? (
        <ErrorNote>{errorMessage(orders.error)}</ErrorNote>
      ) : rows.length === 0 ? (
        <p className="border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          {orders.data.length === 0
            ? "Er zijn nog geen bestellingen. Zodra klanten bestellen, verschijnen ze hier."
            : "Geen bestellingen gevonden met dit filter."}
        </p>
      ) : (
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-cream/60 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Nr.</th>
                <th className="px-4 py-3 font-semibold">Datum</th>
                <th className="px-4 py-3 font-semibold">Klant</th>
                <th className="px-4 py-3 font-semibold">Plaats</th>
                <th className="px-4 py-3 font-semibold">Producten</th>
                <th className="px-4 py-3 text-right font-semibold">Totaal</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((o) => {
                const items = o.anet_order_items.reduce((n, i) => n + i.quantity, 0);
                return (
                  <tr key={o.id} className="hover:bg-cream/50">
                    <td className="px-4 py-3 font-semibold">
                      <Link
                        to="/beheer/bestellingen/$id"
                        params={{ id: o.id }}
                        className="underline-offset-4 hover:underline"
                      >
                        #{o.order_number}
                      </Link>
                      {o.is_test && (
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          test
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDateTime(o.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link to="/beheer/bestellingen/$id" params={{ id: o.id }} className="block">
                        <span className="font-medium">
                          {o.first_name} {o.last_name}
                        </span>
                        <span className="block text-xs text-muted-foreground">{o.email}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">{o.city}</td>
                    <td className="px-4 py-3">{items}×</td>
                    <td className="px-4 py-3 text-right">{formatPrice(o.total_cents)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <NewOrderDialog open={newOpen} onOpenChange={setNewOpen} />
    </AdminPage>
  );
}
