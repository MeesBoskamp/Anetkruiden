import type { Product } from "@/content/products";
import { isSoldOut } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { useTr } from "@/lib/i18n";

/** Prijs (met eventuele van-prijs) en inhoud. Lege velden worden niet getoond. */
export function ProductPrice({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  return (
    <p className={className}>
      {product.compareAtCents && (
        <s className="mr-2 text-muted-foreground">{formatPrice(product.compareAtCents)}</s>
      )}
      <span>{formatPrice(product.priceCents)}</span>
      {product.size && (
        <>
          <span className="mx-3 text-border">|</span>
          <span className="text-muted-foreground">{product.size}</span>
        </>
      )}
    </p>
  );
}

/** Labels boven op een product: uitverkocht, eigen label, voorbeeldproduct. */
export function ProductLabels({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const tr = useTr();
  const soldOut = isSoldOut(product);
  if (!soldOut && !product.badge && !product.placeholder) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {soldOut && (
        <span className="bg-ink px-3 py-1 text-xs font-medium uppercase tracking-wider text-white">
          {tr({ nl: "Uitverkocht", en: "Sold out" })}
        </span>
      )}
      {product.badge && (
        <span className="bg-brand-deep px-3 py-1 text-xs font-medium uppercase tracking-wider text-white">
          {product.badge}
        </span>
      )}
      {product.placeholder && (
        <span className="bg-oak px-3 py-1 text-xs font-medium uppercase tracking-wider text-white">
          {tr({ nl: "Voorbeeldproduct", en: "Example product" })}
        </span>
      )}
    </div>
  );
}
