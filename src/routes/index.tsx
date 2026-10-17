import { createFileRoute, Link } from "@tanstack/react-router";

import { ProductBlock } from "@/components/site/ProductBlock";
import { products } from "@/content/products";
import { useTr } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anetkruiden" },
      { name: "description", content: "Anetkruiden: kruiden uit de natuur." },
      { property: "og:title", content: "Anetkruiden" },
      { property: "og:description", content: "Anetkruiden: kruiden uit de natuur." },
    ],
  }),
  component: Index,
});

function Index() {
  const tr = useTr();

  const reasons = [
    {
      title: { nl: "Weinig producten, goed gekozen", en: "Few products, well chosen" },
      body: {
        nl: "Een kleine collectie waar we volledig achter staan.",
        en: "A small collection we fully stand behind.",
      },
    },
    {
      title: { nl: "Eerlijke informatie", en: "Honest information" },
      body: {
        nl: "Bij elk product staan de ingrediënten en de herkomst duidelijk vermeld.",
        en: "Every product clearly lists its ingredients and origin.",
      },
    },
    {
      title: { nl: "Persoonlijk contact", en: "Personal contact" },
      body: {
        nl: "Vragen over je bestelling? Je krijgt gewoon antwoord van ons.",
        en: "Questions about your order? You get an answer straight from us.",
      },
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-brand text-white">
        {/* Dunne witte kaderlijn, zoals op het etiket */}
        <div
          aria-hidden="true"
          className="absolute inset-x-3 bottom-3 top-[84px] border border-white/90 sm:inset-x-5 sm:bottom-5"
        />
        <div className="relative mx-auto w-full max-w-[1600px] px-8 pb-24 sm:px-12">
          <h1 className="display max-w-4xl text-6xl sm:text-8xl lg:text-9xl">
            {tr({ nl: "Kruiden uit de natuur", en: "Herbs from nature" })}
          </h1>
          <Link to="/shop" className="btn btn-light mt-10">
            {tr({ nl: "Ontdek de producten", en: "Discover the products" })}
          </Link>
        </div>
      </section>

      {/* Welkom */}
      <section className="mx-auto max-w-[1100px] px-4 py-24 text-center sm:px-6">
        <h2 className="display text-5xl sm:text-6xl">
          {tr({ nl: "Welkom bij Anetkruiden", en: "Welcome to Anetkruiden" })}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {tr({
            nl: "Voorbeeldtekst: hier komt één zin over wat Anetkruiden is en voor wie.",
            en: "Example text: one sentence about what Anetkruiden is and who it is for.",
          })}
        </p>
      </section>

      {/* Producten: elk product een eigen groot blok */}
      <section
        aria-label={tr({ nl: "Producten", en: "Products" })}
        className="divide-y divide-border border-y border-border"
      >
        {products.map((p, i) => (
          <ProductBlock key={p.slug} product={p} index={i} />
        ))}
      </section>
      <p className="mt-10 text-center">
        <Link to="/shop" className="underline underline-offset-4 hover:text-brand-deep">
          {tr({ nl: "Bekijk alle producten", en: "View all products" })}
        </Link>
      </p>

      {/* Waarom */}
      <section className="mx-auto max-w-[1600px] px-4 py-24 sm:px-6">
        <h2 className="display mb-12 text-5xl sm:text-6xl">
          {tr({ nl: "Waarom Anetkruiden", en: "Why Anetkruiden" })}
        </h2>
        <ul className="grid gap-10 md:grid-cols-3">
          {reasons.map((r) => (
            <li key={r.title.nl} className="border-t-2 border-ink pt-6">
              <h3 className="square-mark display text-3xl">{tr(r.title)}</h3>
              <p className="mt-3 text-muted-foreground">{tr(r.body)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Verhaal */}
      <section className="bg-brand-deep text-white">
        <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center">
          <h2 className="display text-5xl sm:text-7xl">
            {tr({ nl: "Waarom we zijn begonnen", en: "Why we started" })}
          </h2>
          <div>
            <p className="text-lg text-white">
              {tr({
                nl: "Voorbeeldtekst: hier komt een korte versie van het verhaal achter Anetkruiden.",
                en: "Example text: a short version of the story behind Anetkruiden goes here.",
              })}
            </p>
            <Link to="/over-ons" className="btn btn-light mt-8">
              {tr({ nl: "Lees ons verhaal", en: "Read our story" })}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
