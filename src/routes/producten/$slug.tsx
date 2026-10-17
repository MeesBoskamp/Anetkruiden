import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { AddToCart } from "@/components/site/AddToCart";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductMedia } from "@/components/site/ProductMedia";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getProduct, products } from "@/content/products";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useTr } from "@/lib/i18n";

export const Route = createFileRoute("/producten/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    if (!product) return {};
    const title = `${product.name.nl} | Anetkruiden`;
    return {
      meta: [
        { title },
        { name: "description", content: product.short.nl },
        { property: "og:title", content: title },
        { property: "og:description", content: product.short.nl },
        { property: "og:type", content: "product" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name.nl,
            description: product.short.nl,
            offers: {
              "@type": "Offer",
              priceCurrency: "EUR",
              price: (product.priceCents / 100).toFixed(2),
            },
          }),
        },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const tr = useTr();
  const { add } = useCart();
  const name = tr(product.name);
  const others = products.filter((p) => p.slug !== product.slug);

  return (
    <article className="pb-24 lg:pb-0">
      {/* 1. Hero */}
      <section className="mx-auto grid max-w-[1600px] gap-10 px-4 pt-8 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:pt-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="aspect-square bg-cream">
            <ProductMedia product={product} />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {product.images.slice(1).map((_, i) => (
                <div key={i} className="aspect-square bg-cream">
                  <ProductMedia product={product} image={i + 1} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-6 py-4 lg:py-16">
          <nav aria-label="Broodkruimels" className="text-sm text-muted-foreground">
            <Link to="/shop" className="hover:underline">
              Shop
            </Link>
            <span className="mx-2">/</span>
            <span>{name}</span>
          </nav>
          {product.placeholder && (
            <p className="w-fit bg-oak px-3 py-1 text-xs font-medium uppercase tracking-wider text-white">
              {tr({ nl: "Voorbeeldproduct", en: "Example product" })}
            </p>
          )}
          <h1 className="display text-5xl sm:text-6xl xl:text-7xl [overflow-wrap:anywhere]">
            {name}
          </h1>
          <p className="text-xl">{tr(product.tagline)}</p>
          <p className="text-muted-foreground">{tr(product.short)}</p>
          <p className="text-2xl">
            {formatPrice(product.priceCents)}
            <span className="mx-3 text-border">|</span>
            <span className="text-muted-foreground">{product.size}</span>
          </p>
          <div className="max-w-md">
            <AddToCart slug={product.slug} />
            <p className="mt-3 text-sm text-muted-foreground">
              {tr({
                nl: "Verzending binnen Nederland. Bestellen is nog niet mogelijk: de webshop is in opbouw.",
                en: "Shipping within the Netherlands. Ordering is not yet possible: the shop is under construction.",
              })}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Kerngetallen */}
      <section
        aria-label={tr({ nl: "Kerngegevens", en: "Key facts" })}
        className="mx-auto mt-20 max-w-[1600px] px-4 sm:px-6"
      >
        <dl className="grid grid-cols-2 border-y border-ink md:grid-cols-4">
          {product.facts.map((f, i) => (
            <div key={i} className="border-border p-6 md:border-r md:last:border-r-0">
              <dt className="text-sm text-muted-foreground">{tr(f.label)}</dt>
              <dd className="display mt-1 text-3xl">{tr(f.value)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 3. Verhaal */}
      <section className="mx-auto mt-28 grid max-w-[1600px] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <h2 className="display text-5xl sm:text-6xl">
          {tr({ nl: "Het verhaal van dit product", en: "The story of this product" })}
        </h2>
        <div className="max-w-2xl space-y-5 text-lg">
          {product.story.map((para, i) => (
            <p key={i}>{tr(para)}</p>
          ))}
        </div>
      </section>

      {/* 4. Ingrediënten en herkomst */}
      <section className="mt-28 bg-cream">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
          <h2 className="display text-5xl sm:text-6xl">
            {tr({ nl: "Ingrediënten en herkomst", en: "Ingredients and origin" })}
          </h2>
          <dl className="grid max-w-2xl gap-8 sm:grid-cols-2">
            {[
              { l: { nl: "Ingrediënten", en: "Ingredients" }, v: product.ingredients },
              { l: { nl: "Allergenen", en: "Allergens" }, v: product.allergens },
              { l: { nl: "Herkomst", en: "Origin" }, v: product.origin },
              { l: { nl: "Bewaren", en: "Storage" }, v: product.storage },
            ].map((row) => (
              <div key={row.l.nl}>
                <dt className="square-mark text-sm font-medium">{tr(row.l)}</dt>
                <dd className="mt-2">{tr(row.v)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 5. Gebruik en tip */}
      <section className="mx-auto mt-28 max-w-[1600px] px-4 sm:px-6">
        <h2 className="display mb-10 text-5xl sm:text-6xl">
          {tr({ nl: "Zo gebruik je het", en: "How to use it" })}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {product.usage.map((u, i) => (
            <div key={i} className="border border-border bg-card p-8">
              <h3 className="display text-3xl">{tr(u.title)}</h3>
              <p className="mt-3 text-muted-foreground">{tr(u.body)}</p>
            </div>
          ))}
          <div className="bg-ink p-8 text-white">
            <p className="text-sm font-medium uppercase tracking-wider text-calendula">Tip</p>
            <p className="mt-3 text-lg">{tr(product.tip)}</p>
          </div>
        </div>
      </section>

      {/* 6. Veelgestelde vragen */}
      <section className="mx-auto mt-28 grid max-w-[1600px] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <h2 className="display text-5xl sm:text-6xl">
          {tr({ nl: "Veelgestelde vragen", en: "Frequently asked questions" })}
        </h2>
        <Accordion type="single" collapsible className="max-w-2xl">
          {product.faq.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-lg">{tr(item.q)}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {tr(item.a)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* 7. Combineer met */}
      <section className="mx-auto mt-28 max-w-[1600px] px-4 sm:px-6">
        <h2 className="display mb-10 text-5xl sm:text-6xl">
          {tr({ nl: "Combineer met", en: "Pair with" })}
        </h2>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {others.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>

      {/* 8. Beoordelingen: bewust niet getoond tot er echte reviews zijn */}

      {/* 9. Vaste balk op mobiel */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-border bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{formatPrice(product.priceCents)}</p>
        </div>
        <button type="button" className="btn btn-dark" onClick={() => add(product.slug)}>
          {tr({ nl: "In winkelmand", en: "Add to cart" })}
        </button>
      </div>
    </article>
  );
}
