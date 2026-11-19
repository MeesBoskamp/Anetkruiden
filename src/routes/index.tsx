import { createFileRoute, Link } from "@tanstack/react-router";

import { withBrand } from "@/components/site/Brand";
import { ProductBlock } from "@/components/site/ProductBlock";
import { useCatalog } from "@/lib/catalog";
import { useTr } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ANET | Kruidenthee en DIY-pakketten" },
      {
        name: "description",
        content:
          "ANET: kruidenthee en DIY-pakketten, gemaakt met kruiden uit een eigen kruidentuin in het Naardermeer.",
      },
      { property: "og:title", content: "ANET | Kruidenthee en DIY-pakketten" },
      {
        property: "og:description",
        content:
          "ANET: kruidenthee en DIY-pakketten, gemaakt met kruiden uit een eigen kruidentuin in het Naardermeer.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const tr = useTr();
  const products = useCatalog();

  const reasons = [
    // Afgeleid uit de Over mij-tekst van Annette.
    {
      title: { nl: "Uit eigen kruidentuin", en: "From my own herb garden" },
      body: {
        nl: "Kamille, goudsbloem, korenbloem, citroenmelisse, lavendel en bergamot: gekweekt, geoogst en gedroogd in het Naardermeer.",
        en: "Chamomile, marigold, cornflower, lemon balm, lavender and bergamot: grown, harvested and dried in the Naardermeer.",
      },
    },
    {
      title: { nl: "Zelf aan de slag", en: "Make it yourself" },
      body: {
        nl: "Van een heerlijk kopje thee tot een zelfgemaakte zalf. Met een DIY-pakket ga je zelf aan de slag.",
        en: "From a lovely cup of tea to a homemade salve. With a DIY kit you get started yourself.",
      },
    },
    {
      title: { nl: "Goed voor bijen en vlinders", en: "Good for bees and butterflies" },
      body: {
        nl: "De kruidentuin is ook een fijne plek voor bijen, hommels en vlinders.",
        en: "The herb garden is also a great place for bees, bumblebees and butterflies.",
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
          {tr({ nl: "Welkom bij ANET", en: "Welcome to ANET" })}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {tr({
            nl: "Kruidenthee en DIY-pakketten, gemaakt met kruiden uit mijn eigen kruidentuin in het Naardermeer. Zodat ook jij kunt genieten van de geuren, smaken en mogelijkheden van kruiden.",
            en: "Herbal tea and DIY kits, made with herbs from my own herb garden in the Naardermeer. So that you too can enjoy the scents, flavours and possibilities of herbs.",
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
          {tr({ nl: "Waarom ANET", en: "Why ANET" })}
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
        <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center md:gap-16">
          <img
            src="/images/sfeer/brandnetel-en-kamille.jpg"
            alt={tr({
              nl: "Een zakje kruidenthee tussen glazen potten met gedroogde brandnetel en kamille",
              en: "A bag of herbal tea between glass jars of dried nettle and chamomile",
            })}
            width={1200}
            height={1600}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover md:order-2"
          />
          <div>
            <h2 className="display mb-8 text-5xl sm:text-7xl">
              {tr({ nl: "Hoe het begon", en: "How it started" })}
            </h2>
            <p className="text-lg text-white">
              {withBrand(
                tr({
                  nl: "Een paar jaar geleden bezocht ik in Frankrijk een prachtige kruidentuin, waar theemengsels en zalven werden gemaakt van kruiden uit die tuin. Begin 2026 kreeg ik de kans om een stukje grond in het Naardermeer om te toveren tot mijn eigen kruidentuin. Wat begon als een experiment, groeide uit tot ANET.",
                  en: "A few years ago I visited a beautiful herb garden in France, where tea blends and salves were made from the herbs grown there. In early 2026 I got the chance to turn a small plot of land in the Naardermeer into my own herb garden. What started as an experiment grew into ANET.",
                }),
              )}
            </p>
            <Link to="/over-ons" className="btn btn-light mt-8">
              {tr({ nl: "Lees mijn verhaal", en: "Read my story" })}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
