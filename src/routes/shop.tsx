import { createFileRoute } from "@tanstack/react-router";

import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/content/products";
import { useTr } from "@/lib/i18n";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop | Anetkruiden" },
      { name: "description", content: "Alle producten van Anetkruiden op één plek." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const tr = useTr();
  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-8 pt-16 sm:px-6 sm:pt-24">
      <header className="mb-16 text-center">
        <h1 className="display text-6xl sm:text-8xl">
          Shop <sup className="align-super text-2xl font-normal">{products.length}</sup>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          {tr({
            nl: "Het volledige assortiment op één plek, met bij elk product de ingrediënten en herkomst.",
            en: "The full range in one place, with ingredients and origin for every product.",
          })}
        </p>
      </header>
      <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.slug}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
