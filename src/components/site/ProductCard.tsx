import { Link } from "@tanstack/react-router";

import type { Product } from "@/content/products";
import { formatPrice } from "@/lib/format";
import { useTr } from "@/lib/i18n";

import { ProductMedia } from "./ProductMedia";

export function ProductCard({ product }: { product: Product }) {
  const tr = useTr();
  const name = tr(product.name);
  return (
    <Link to="/producten/$slug" params={{ slug: product.slug }} className="group block text-center">
      <div className="aspect-square overflow-hidden bg-cream">
        <ProductMedia
          product={product}
          className="size-full transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h3 className="display mt-5 text-2xl">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tr(product.tagline)}</p>
      <p className="mt-2 text-sm">
        {formatPrice(product.priceCents)}
        <span className="mx-2 text-border">|</span>
        <span className="text-muted-foreground">{product.size}</span>
      </p>
    </Link>
  );
}
