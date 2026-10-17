import { Link } from "@tanstack/react-router";

import { useCart } from "@/lib/cart";
import type { Product } from "@/content/products";
import { formatPrice } from "@/lib/format";
import { useTr } from "@/lib/i18n";

import { ProductArt } from "./ProductArt";

/** Groot productblok voor de homepage. Met weinig producten krijgt elk product veel ruimte. */
export function ProductBlock({ product, index }: { product: Product; index: number }) {
  const tr = useTr();
  const { add } = useCart();
  const name = tr(product.name);
  const reversed = index % 2 === 1;

  return (
    <article className="grid items-stretch md:grid-cols-2">
      <div
        className={`aspect-square bg-stone md:aspect-auto md:min-h-[560px] ${reversed ? "md:order-2" : ""}`}
      >
        <ProductArt art={product.art} label={name} className="size-full" />
      </div>
      <div
        className={`flex flex-col justify-center gap-5 px-6 py-12 sm:px-12 lg:px-20 ${reversed ? "md:order-1" : ""}`}
      >
        <p className="square-mark text-sm font-medium tracking-wide text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="display text-5xl sm:text-6xl">{name}</h3>
        <p className="max-w-md text-lg">{tr(product.tagline)}</p>
        <p className="max-w-md text-muted-foreground">{tr(product.short)}</p>
        <p className="text-lg">
          {formatPrice(product.priceCents)}
          <span className="mx-3 text-border">|</span>
          <span className="text-muted-foreground">{product.size}</span>
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/producten/$slug" params={{ slug: product.slug }} className="btn btn-dark">
            {tr({ nl: "Bekijk product", en: "View product" })}
          </Link>
          <button type="button" className="btn btn-outline" onClick={() => add(product.slug)}>
            {tr({ nl: "In winkelmand", en: "Add to cart" })}
          </button>
        </div>
      </div>
    </article>
  );
}
