import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { createOrder, errorMessage, listAdminProducts, type NewOrderInput } from "@/lib/admin/api";
import { formatPrice } from "@/lib/format";

import { adminBtn, ErrorNote, Field, inputClass } from "./ui";

const emptyCustomer: NewOrderInput["customer"] = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  company_name: "",
  street: "",
  house_number: "",
  house_number_addition: "",
  postal_code: "",
  city: "",
  customer_note: "",
};

/** Bestelling handmatig invoeren (bijv. telefonisch of op de markt) of een testbestelling maken. */
export function NewOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const products = useQuery({
    queryKey: ["admin", "products"],
    queryFn: listAdminProducts,
    enabled: open,
  });
  const [customer, setCustomer] = useState(emptyCustomer);
  const [lines, setLines] = useState<{ product_id: string; quantity: number }[]>([
    { product_id: "", quantity: 1 },
  ]);
  const [test, setTest] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async (id) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin"] }),
        qc.invalidateQueries({ queryKey: ["catalog"] }),
      ]);
      toast.success("Bestelling aangemaakt");
      onOpenChange(false);
      setCustomer(emptyCustomer);
      setLines([{ product_id: "", quantity: 1 }]);
      navigate({ to: "/beheer/bestellingen/$id", params: { id } });
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const available = (products.data ?? []).filter((p) => p.is_visible);
  const total = lines.reduce((sum, l) => {
    const p = available.find((x) => x.id === l.product_id);
    return sum + (p ? p.price_cents * l.quantity : 0);
  }, 0);

  function set<K extends keyof NewOrderInput["customer"]>(key: K, value: string) {
    setCustomer((c) => ({ ...c, [key]: value }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const items = lines.filter((l) => l.product_id && l.quantity > 0);
    if (items.length === 0) {
      setError("Kies minimaal één product.");
      return;
    }
    if (!/^\d{4}\s?[a-zA-Z]{2}$/.test(customer.postal_code.trim())) {
      setError("Vul een geldige Nederlandse postcode in (bijv. 1234 AB).");
      return;
    }
    mutation.mutate({ customer, items, test });
  }

  const text = (
    key: keyof NewOrderInput["customer"],
    label: string,
    opts: { required?: boolean; type?: string; autoComplete?: string; className?: string } = {},
  ) => (
    <Field label={label} htmlFor={`no-${key}`} required={opts.required} className={opts.className}>
      <input
        id={`no-${key}`}
        type={opts.type ?? "text"}
        required={opts.required}
        autoComplete={opts.autoComplete ?? "off"}
        value={customer[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
        className={inputClass}
      />
    </Field>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-none">
        <DialogTitle className="text-3xl">Bestelling toevoegen</DialogTitle>
        <DialogDescription>
          Voor een bestelling die buiten de webshop binnenkomt, of om het beheer uit te proberen. De
          voorraad wordt direct verlaagd.
        </DialogDescription>
        <form onSubmit={submit} className="mt-2 space-y-6">
          <fieldset className="space-y-3">
            <legend className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Producten
            </legend>
            {lines.map((line, i) => (
              <div key={i} className="flex gap-2">
                <select
                  aria-label="Product"
                  value={line.product_id}
                  onChange={(e) =>
                    setLines((ls) =>
                      ls.map((l, j) => (j === i ? { ...l, product_id: e.target.value } : l)),
                    )
                  }
                  className={inputClass}
                >
                  <option value="">Kies een product…</option>
                  {available.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                      {p.name} · {formatPrice(p.price_cents)} · voorraad {p.stock}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={99}
                  aria-label="Aantal"
                  value={line.quantity}
                  onChange={(e) =>
                    setLines((ls) =>
                      ls.map((l, j) =>
                        j === i ? { ...l, quantity: Math.max(1, Number(e.target.value) || 1) } : l,
                      ),
                    )
                  }
                  className={`${inputClass} w-20`}
                />
                <button
                  type="button"
                  aria-label="Regel verwijderen"
                  disabled={lines.length === 1}
                  onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}
                  className={adminBtn.ghost}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <button
                type="button"
                className={adminBtn.ghost}
                onClick={() => setLines((ls) => [...ls, { product_id: "", quantity: 1 }])}
              >
                <Plus className="size-4" /> Product toevoegen
              </button>
              <span className="text-sm">
                Subtotaal <strong>{formatPrice(total)}</strong>
              </span>
            </div>
            {available.length > 0 && available.every((p) => p.stock <= 0) && (
              <p className="text-sm text-muted-foreground">
                Alle producten staan op voorraad 0. Vul eerst de voorraad aan.
              </p>
            )}
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Klant
            </legend>
            {text("first_name", "Voornaam", { required: true })}
            {text("last_name", "Achternaam", { required: true })}
            {text("email", "E-mailadres", { required: true, type: "email" })}
            {text("phone", "Telefoon", { type: "tel" })}
            {text("company_name", "Bedrijfsnaam", { className: "sm:col-span-2" })}
          </fieldset>

          <fieldset className="grid grid-cols-6 gap-4">
            <legend className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Bezorgadres (Nederland)
            </legend>
            {text("street", "Straat", { required: true, className: "col-span-6 sm:col-span-4" })}
            {text("house_number", "Huisnr.", {
              required: true,
              className: "col-span-3 sm:col-span-1",
            })}
            {text("house_number_addition", "Toev.", { className: "col-span-3 sm:col-span-1" })}
            {text("postal_code", "Postcode", {
              required: true,
              className: "col-span-6 sm:col-span-2",
            })}
            {text("city", "Plaats", { required: true, className: "col-span-6 sm:col-span-4" })}
          </fieldset>

          <Field label="Opmerking van de klant" htmlFor="no-note">
            <textarea
              id="no-note"
              rows={2}
              value={customer.customer_note ?? ""}
              onChange={(e) => set("customer_note", e.target.value)}
              className={inputClass}
            />
          </Field>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={test}
              onChange={(e) => setTest(e.target.checked)}
              className="mt-1"
            />
            <span>
              <strong>Testbestelling</strong>
              <span className="block text-muted-foreground">
                Telt niet mee in de omzet en kan later weer verwijderd worden.
              </span>
            </span>
          </label>

          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={adminBtn.secondary}
              onClick={() => onOpenChange(false)}
            >
              Annuleren
            </button>
            <button type="submit" className={adminBtn.primary} disabled={mutation.isPending}>
              {mutation.isPending ? "Bezig…" : "Bestelling aanmaken"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
