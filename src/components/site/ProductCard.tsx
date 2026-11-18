import { Link } from "@tanstack/react-router";

import type { Product } from "@/content/products";
import { useTr } from "@/lib/i18n";

import { ProductMedia } from "./ProductMedia";
import { ProductLabels, ProductPrice } from "./ProductPrice";

export function ProductCard({ product }: { product: Product }) {
  const tr = useTr();
  const name = tr(product.name);
  return (
    <Link to="/producten/$slug" params={{ slug: product.slug }} className="group block text-center">
      <div className="relative aspect-square overflow-hidden bg-cream">
        <ProductMedia
          product={product}
          className="size-full transition-transform duration-500 group-hover:scale-105"
        />
        <ProductLabels product={product} className="absolute left-3 top-3" />
      </div>
      <h3 className="display mt-5 text-2xl">{name}</h3>
      {product.tagline && (
        <p className="mt-1 text-sm text-muted-foreground">{tr(product.tagline)}</p>
      )}
      <ProductPrice product={product} className="mt-2 text-sm" />
    </Link>
  );
}
