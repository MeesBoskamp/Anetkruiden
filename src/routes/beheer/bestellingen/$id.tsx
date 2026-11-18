import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, Mail, Phone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  AdminPage,
  adminBtn,
  ErrorNote,
  Field,
  inputClass,
  Loading,
  Panel,
  StatusBadge,
} from "@/components/admin/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteOrder,
  errorMessage,
  formatDateTime,
  getOrder,
  ORDER_STATUSES,
  STATUS_HELP,
  STATUS_LABEL,
  updateOrder,
  type OrderStatus,
} from "@/lib/admin/api";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/beheer/bestellingen/$id")({
  component: BestellingDetail,
});

/** De normale volgorde; geannuleerd staat apart. */
const FLOW: OrderStatus[] = ORDER_STATUSES.filter((s) => s !== "geannuleerd");

function BestellingDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ["admin", "order", id], queryFn: () => getOrder(id) });
  const [tracking, setTracking] = useState("");
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (query.data) {
      setTracking(query.data.order.track_and_trace ?? "");
      setNote(query.data.order.admin_note ?? "");
    }
  }, [query.data]);

  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["admin"] }),
      qc.invalidateQueries({ queryKey: ["catalog"] }),
    ]);

  const update = useMutation({
    mutationFn: (patch: Parameters<typeof updateOrder>[1]) => updateOrder(id, patch),
    onSuccess: async (_, patch) => {
      await refresh();
      toast.success(patch.status ? `Status: ${STATUS_LABEL[patch.status]}` : "Opgeslagen");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: () => deleteOrder(id),
    onSuccess: async () => {
      await refresh();
      toast.success("Bestelling verwijderd");
      navigate({ to: "/beheer/bestellingen" });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  if (query.isPending) return <Loading />;
  if (query.error) {
    return (
      <AdminPage title="Bestelling">
        <ErrorNote>{errorMessage(query.error)}</ErrorNote>
      </AdminPage>
    );
  }

  const { order, events } = query.data;
  const address = [
    order.company_name,
    `${order.first_name} ${order.last_name}`,
    `${order.street} ${order.house_number}${order.house_number_addition ? ` ${order.house_number_addition}` : ""}`,
    `${order.postal_code.replace(/^(\d{4})([A-Z]{2})$/, "$1 $2")} ${order.city}`,
    order.country === "NL" ? "Nederland" : order.country,
  ].filter(Boolean) as string[];

  const currentIndex = FLOW.indexOf(order.status);
  const next =
    currentIndex >= 0 && currentIndex < FLOW.length - 1 ? FLOW[currentIndex + 1] : undefined;
  const cancelled = order.status === "geannuleerd";
  const canDelete = order.is_test || order.status === "aangemaakt" || cancelled;

  function setStatus(status: OrderStatus) {
    if (status === order.status) return;
    if (status === "geannuleerd") setConfirmCancel(true);
    else update.mutate({ status });
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address.join("\n"));
      toast.success("Adres gekopieerd");
    } catch {
      toast.error("Kopiëren lukte niet");
    }
  }

  return (
    <AdminPage
      title={
        <>
          Bestelling #{order.order_number}
          {order.is_test && (
            <span className="ml-3 align-middle font-sans text-sm not-italic text-muted-foreground">
              testbestelling
            </span>
          )}
        </>
      }
      description={`Geplaatst op ${formatDateTime(order.created_at)}`}
      actions={
        <Link to="/beheer/bestellingen" className={adminBtn.secondary}>
          <ArrowLeft className="size-4" /> Alle bestellingen
        </Link>
      }
    >
      {/* Status */}
      <Panel title="Status" className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={order.status} className="px-3 py-1.5 text-sm" />
          <span className="text-sm text-muted-foreground">{STATUS_HELP[order.status]}</span>
        </div>

        <ol className="mt-6 grid gap-2 sm:grid-cols-5" aria-label="Verloop van de bestelling">
          {FLOW.map((s, i) => {
            const done = !cancelled && currentIndex >= i;
            const active = order.status === s;
            return (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => setStatus(s)}
                  disabled={update.isPending}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2 border px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                    active
                      ? "border-ink bg-ink text-white"
                      : done
                        ? "border-ink/30 bg-cream"
                        : "border-border bg-card hover:border-ink",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px]",
                      active
                        ? "border-white"
                        : done
                          ? "border-ink bg-ink text-white"
                          : "border-border",
                    )}
                  >
                    {done && !active ? <Check className="size-3" /> : i + 1}
                  </span>
                  {STATUS_LABEL[s]}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex flex-wrap gap-2">
          {next && !cancelled && (
            <button
              type="button"
              className={adminBtn.primary}
              disabled={update.isPending}
              onClick={() => setStatus(next)}
            >
              Zet op “{STATUS_LABEL[next]}”
            </button>
          )}
          {cancelled ? (
            <button
              type="button"
              className={adminBtn.secondary}
              disabled={update.isPending}
              onClick={() => update.mutate({ status: "aangemaakt" })}
            >
              Bestelling heropenen
            </button>
          ) : (
            order.status !== "verzonden" && (
              <button
                type="button"
                className={adminBtn.ghost}
                disabled={update.isPending}
                onClick={() => setStatus("geannuleerd")}
              >
                Annuleren
              </button>
            )
          )}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Producten */}
          <Panel title="Producten">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="pb-2 font-semibold">Product</th>
                  <th className="pb-2 text-right font-semibold">Aantal</th>
                  <th className="pb-2 text-right font-semibold">Prijs</th>
                  <th className="pb-2 text-right font-semibold">Totaal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.anet_order_items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium">{item.product_name}</td>
                    <td className="py-3 text-right">{item.quantity}×</td>
                    <td className="py-3 text-right">{formatPrice(item.unit_price_cents)}</td>
                    <td className="py-3 text-right">
                      {formatPrice(item.unit_price_cents * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-ink">
                <tr>
                  <td colSpan={3} className="pt-3 text-right text-muted-foreground">
                    Subtotaal
                  </td>
                  <td className="pt-3 text-right">{formatPrice(order.subtotal_cents)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-right text-muted-foreground">
                    Verzendkosten
                  </td>
                  <td className="text-right">{formatPrice(order.shipping_cents)}</td>
                </tr>
                <tr className="text-base font-semibold">
                  <td colSpan={3} className="pt-1 text-right">
                    Totaal
                  </td>
                  <td className="pt-1 text-right">{formatPrice(order.total_cents)}</td>
                </tr>
              </tfoot>
            </table>
          </Panel>

          {/* Verzending */}
          <Panel
            title="Verzending"
            description="Track-and-tracecode en eigen notities (niet zichtbaar voor de klant)."
          >
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                update.mutate({
                  track_and_trace: tracking.trim() || null,
                  admin_note: note.trim() || null,
                });
              }}
            >
              <Field label="Track-and-tracecode" htmlFor="tt">
                <input
                  id="tt"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Interne notitie" htmlFor="note">
                <textarea
                  id="note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <button type="submit" className={adminBtn.primary} disabled={update.isPending}>
                Opslaan
              </button>
            </form>
          </Panel>

          {/* Historie */}
          <Panel title="Historie">
            <ol className="space-y-3 border-l border-border pl-5">
              {events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-brand" />
                  <p className="text-sm font-semibold">{STATUS_LABEL[e.status]}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(e.created_at)}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-6">
          {/* Klant */}
          <Panel title="Klant">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Naam</dt>
                <dd className="font-medium">
                  {order.first_name} {order.last_name}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">E-mail</dt>
                <dd>
                  <a
                    href={`mailto:${order.email}`}
                    className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                  >
                    <Mail className="size-3.5" /> {order.email}
                  </a>
                </dd>
              </div>
              {order.phone && (
                <div>
                  <dt className="text-muted-foreground">Telefoon</dt>
                  <dd>
                    <a
                      href={`tel:${order.phone}`}
                      className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                    >
                      <Phone className="size-3.5" /> {order.phone}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="flex items-center justify-between text-muted-foreground">
                  Bezorgadres
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-ink"
                  >
                    <Copy className="size-3.5" /> Kopieer
                  </button>
                </dt>
                <dd className="mt-1 whitespace-pre-line bg-cream/60 p-3 leading-relaxed">
                  {address.join("\n")}
                </dd>
              </div>
              {order.customer_note && (
                <div>
                  <dt className="text-muted-foreground">Opmerking van de klant</dt>
                  <dd className="whitespace-pre-line">{order.customer_note}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Nieuwsbrief</dt>
                <dd>{order.newsletter_opt_in ? "Ja, aangemeld" : "Nee"}</dd>
              </div>
            </dl>
          </Panel>

          {/* Betaling */}
          <Panel title="Betaling">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Betaald op</dt>
                <dd>{order.paid_at ? formatDateTime(order.paid_at) : "Nog niet betaald"}</dd>
              </div>
              {order.payment_provider && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Via</dt>
                  <dd className="capitalize">{order.payment_provider}</dd>
                </div>
              )}
              {order.payment_id && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Betalingskenmerk</dt>
                  <dd className="font-mono text-xs">{order.payment_id}</dd>
                </div>
              )}
              {order.shipped_at && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Verzonden op</dt>
                  <dd>{formatDateTime(order.shipped_at)}</dd>
                </div>
              )}
            </dl>
          </Panel>

          {canDelete && (
            <button
              type="button"
              className={`${adminBtn.danger} w-full`}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" /> Bestelling verwijderen
            </button>
          )}
        </div>
      </div>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogTitle>Bestelling annuleren?</AlertDialogTitle>
          <AlertDialogDescription>
            De producten gaan terug in de voorraad. Een eventuele terugbetaling regel je apart
            (bijv. in Mollie). Je kunt de bestelling later heropenen.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Terug</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none"
              onClick={() => update.mutate({ status: "geannuleerd" })}
            >
              Annuleren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogTitle>Bestelling #{order.order_number} verwijderen?</AlertDialogTitle>
          <AlertDialogDescription>
            Dit kan niet ongedaan worden gemaakt.
            {!cancelled && " De producten gaan eerst terug in de voorraad."}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Terug</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                // Eerst annuleren zodat de voorraad terugkomt, daarna verwijderen.
                if (!cancelled) await updateOrder(id, { status: "geannuleerd" }).catch(() => {});
                remove.mutate();
              }}
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  );
}
