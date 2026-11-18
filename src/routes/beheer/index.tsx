import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, PackageCheck, ShoppingBag, Tags } from "lucide-react";

import { AdminPage, ErrorNote, Loading, StatusBadge } from "@/components/admin/ui";
import {
  errorMessage,
  formatDateTime,
  listAdminProducts,
  listOrders,
  LOW_STOCK,
  TO_SHIP,
} from "@/lib/admin/api";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/beheer/")({
  component: Overzicht,
});

function Overzicht() {
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: listOrders });
  const products = useQuery({ queryKey: ["admin", "products"], queryFn: listAdminProducts });

  if (orders.isPending || products.isPending) return <Loading />;
  if (orders.error || products.error) {
    return (
      <AdminPage title="Overzicht">
        <ErrorNote>{errorMessage(orders.error ?? products.error)}</ErrorNote>
      </AdminPage>
    );
  }

  const live = orders.data.filter((o) => !o.is_test);
  const toShip = orders.data.filter((o) => TO_SHIP.includes(o.status));
  const unpaid = orders.data.filter((o) => o.status === "aangemaakt");
  const soldOut = products.data.filter((p) => p.is_visible && p.stock <= 0);
  const low = products.data.filter((p) => p.is_visible && p.stock > 0 && p.stock <= LOW_STOCK);
  const revenue = live
    .filter((o) => !["aangemaakt", "geannuleerd"].includes(o.status))
    .reduce((sum, o) => sum + o.total_cents, 0);

  const cards = [
    {
      to: "/beheer/bestellingen",
      icon: PackageCheck,
      label: "Te verzenden",
      value: toShip.length,
      note: "betaald, in behandeling of klaar",
    },
    {
      to: "/beheer/bestellingen",
      icon: ShoppingBag,
      label: "Nog niet betaald",
      value: unpaid.length,
      note: "status aangemaakt",
    },
    {
      to: "/beheer/voorraad",
      icon: Boxes,
      label: "Uitverkocht",
      value: soldOut.length,
      note: low.length ? `${low.length} bijna op (≤ ${LOW_STOCK})` : "zichtbare producten",
    },
    {
      to: "/beheer/producten",
      icon: Tags,
      label: "Producten online",
      value: products.data.filter((p) => p.is_visible).length,
      note: `van ${products.data.length} in totaal`,
    },
  ] as const;

  return (
    <AdminPage
      title="Overzicht"
      description={`Omzet uit betaalde bestellingen (zonder tests): ${formatPrice(revenue)}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="group border border-border bg-card p-5 transition-colors hover:border-ink"
          >
            <c.icon className="size-5 text-brand-deep" />
            <p className="mt-4 text-sm font-semibold">{c.label}</p>
            <p className="font-display text-5xl italic">{c.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-2xl">Laatste bestellingen</h2>
          <Link
            to="/beheer/bestellingen"
            className="inline-flex items-center gap-1 text-sm font-semibold"
          >
            Alle bestellingen <ArrowRight className="size-4" />
          </Link>
        </div>
        {orders.data.length === 0 ? (
          <p className="border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            Er zijn nog geen bestellingen.
          </p>
        ) : (
          <ul className="divide-y divide-border border border-border bg-card">
            {orders.data.slice(0, 6).map((o) => (
              <li key={o.id}>
                <Link
                  to="/beheer/bestellingen/$id"
                  params={{ id: o.id }}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-cream/60"
                >
                  <span className="w-16 font-semibold">#{o.order_number}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {o.first_name} {o.last_name}
                    {o.is_test && (
                      <span className="ml-2 text-xs text-muted-foreground">(test)</span>
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(o.created_at)}
                  </span>
                  <span className="w-20 text-right">{formatPrice(o.total_cents)}</span>
                  <StatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPage>
  );
}
