import type { Product } from "@/content/products";
import { useTr } from "@/lib/i18n";

import { ProductArt } from "./ProductArt";

/** Toont de hoofdfoto van een product, of de tijdelijke illustratie als er nog geen foto is. */
export function ProductMedia({
  product,
  className = "size-full",
  image = 0,
}: {
  product: Product;
  className?: string;
  image?: number;
}) {
  const tr = useTr();
  const name = tr(product.name);
  const photo = product.images?.[image];
  if (photo) {
    return (
      <img
        src={photo.src}
        alt={tr(photo.alt)}
        className={`${className} object-cover`}
        loading={image === 0 ? "eager" : "lazy"}
      />
    );
  }
  return <ProductArt art={product.art} label={name} className={className} />;
}
