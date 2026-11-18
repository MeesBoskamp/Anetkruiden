import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import type { Product } from "@/content/products";
import { maxOrderable } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useTr } from "@/lib/i18n";

export function AddToCart({ product, compact = false }: { product: Product; compact?: boolean }) {
  const tr = useTr();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const max = maxOrderable(product);

  if (max <= 0) {
    return (
      <button type="button" disabled className="btn btn-dark w-full cursor-not-allowed opacity-50">
        {tr({ nl: "Uitverkocht", en: "Sold out" })}
      </button>
    );
  }

  const button = (
    <button
      type="button"
      className="btn btn-dark flex-1"
      onClick={() => add(product.slug, Math.min(qty, max))}
    >
      {tr({ nl: "In winkelmand", en: "Add to cart" })}
    </button>
  );

  if (compact) return button;

  return (
    <div className="flex gap-3">
      <div className="flex items-center border border-ink">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label={tr({ nl: "Minder", en: "Less" })}
          className="px-4 py-3"
        >
          <Minus className="size-4" />
        </button>
        <span className="min-w-8 text-center" aria-live="polite">
          {Math.min(qty, max)}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(max, q + 1))}
          disabled={qty >= max}
          aria-label={tr({ nl: "Meer", en: "More" })}
          className="px-4 py-3 disabled:opacity-30"
        >
          <Plus className="size-4" />
        </button>
      </div>
      {button}
    </div>
  );
}
