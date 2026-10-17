import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { getProduct } from "@/content/products";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useTr } from "@/lib/i18n";

import { ProductMedia } from "./ProductMedia";

export function CartDrawer() {
  const tr = useTr();
  const { items, count, subtotalCents, open, setOpen, setQty, remove } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col bg-paper p-0 sm:max-w-md">
        <div className="border-b border-border px-6 py-5">
          <SheetTitle className="display text-3xl">
            {tr({ nl: "Je winkelmand", en: "Your cart" })} ({count})
          </SheetTitle>
          <SheetDescription className="sr-only">
            {tr({
              nl: "Overzicht van de producten in je winkelmand",
              en: "Overview of the products in your cart",
            })}
          </SheetDescription>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-5 px-6">
            <p className="text-lg">
              {tr({ nl: "Je winkelmand is nog leeg.", en: "Your cart is empty." })}
            </p>
            <Link to="/shop" onClick={() => setOpen(false)} className="btn btn-dark">
              {tr({ nl: "Bekijk de producten", en: "See the products" })}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {items.map((item) => {
                const product = getProduct(item.slug);
                if (!product) return null;
                const name = tr(product.name);
                return (
                  <li key={item.slug} className="flex gap-4 py-5">
                    <ProductMedia product={product} className="size-20 shrink-0" />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to="/producten/$slug"
                          params={{ slug: product.slug }}
                          onClick={() => setOpen(false)}
                          className="font-medium hover:underline"
                        >
                          {name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(item.slug)}
                          aria-label={tr({ nl: `${name} verwijderen`, en: `Remove ${name}` })}
                          className="p-1 opacity-60 hover:opacity-100"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.size}</p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center border border-ink">
                          <button
                            type="button"
                            onClick={() => setQty(item.slug, item.qty - 1)}
                            aria-label={tr({ nl: "Minder", en: "Less" })}
                            className="p-2"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="min-w-8 text-center text-sm" aria-live="polite">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(item.slug, item.qty + 1)}
                            aria-label={tr({ nl: "Meer", en: "More" })}
                            className="p-2"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="font-medium">
                          {formatPrice(product.priceCents * item.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-border px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span>{tr({ nl: "Subtotaal", en: "Subtotal" })}</span>
                <span className="text-xl font-semibold">{formatPrice(subtotalCents)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {tr({
                  nl: "Verzendkosten en btw worden bij het afrekenen getoond.",
                  en: "Shipping and VAT are shown at checkout.",
                })}
              </p>
              <button
                type="button"
                disabled
                className="btn btn-dark mt-4 w-full cursor-not-allowed opacity-50"
              >
                {tr({ nl: "Afrekenen", en: "Checkout" })}
              </button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {tr({
                  nl: "Bestellen is nog niet mogelijk. De webshop is in opbouw.",
                  en: "Ordering is not yet possible. The shop is under construction.",
                })}
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
