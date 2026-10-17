import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/lib/cart";
import { useTr } from "@/lib/i18n";

export function AddToCart({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const tr = useTr();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const button = (
    <button type="button" className="btn btn-dark flex-1" onClick={() => add(slug, qty)}>
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
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(20, q + 1))}
          aria-label={tr({ nl: "Meer", en: "More" })}
          className="px-4 py-3"
        >
          <Plus className="size-4" />
        </button>
      </div>
      {button}
    </div>
  );
}
