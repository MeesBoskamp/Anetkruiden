import type { Text } from "@/lib/i18n";

/**
 * VOORBEELDPRODUCTEN: namen, prijzen en teksten zijn tijdelijk en moeten door de
 * ondernemer worden vervangen. In fase 3 verhuizen deze gegevens naar de database
 * (tabellen products / product_variants, zie PLAN.md); de vorm hieronder volgt dat model.
 *
 * Let op: geen gezondheidsclaims in productteksten.
 */
export type Product = {
  slug: string;
  name: Text;
  tagline: Text;
  short: Text;
  priceCents: number;
  size: string;
  /** Kleuren voor de tijdelijke illustratie, tot er echte foto's zijn. */
  art: { bg: string; fg: string; variant: "leaf" | "leaves" | "sprig" | "grain" | "drop" };
  /** Echte productfoto's (eerste is de hoofdfoto). Zonder foto's wordt de illustratie getoond. */
  images?: { src: string; alt: Text }[];
  placeholder: boolean;
  facts: { label: Text; value: Text }[];
  story: Text[];
  ingredients: Text;
  origin: Text;
  allergens: Text;
  storage: Text;
  usage: { title: Text; body: Text }[];
  tip: Text;
  faq: { q: Text; a: Text }[];
};

const TODO: Text = { nl: "[nog invullen]", en: "[to be filled in]" };

const commonFacts = (size: string): Product["facts"] => [
  { label: { nl: "Inhoud", en: "Contents" }, value: { nl: size } },
  { label: { nl: "Herkomst", en: "Origin" }, value: TODO },
  { label: { nl: "Houdbaar tot", en: "Best before" }, value: TODO },
  { label: { nl: "Verpakking", en: "Packaging" }, value: TODO },
];

const commonFaq: Product["faq"] = [
  {
    q: { nl: "Hoe lang is dit product houdbaar?", en: "How long does this product keep?" },
    a: {
      nl: "De houdbaarheidsdatum staat op de verpakking. [Richtlijn nog invullen.]",
      en: "The best-before date is on the packaging. [Guideline to be filled in.]",
    },
  },
  {
    q: { nl: "Wanneer wordt mijn bestelling verzonden?", en: "When will my order ship?" },
    a: {
      nl: "Bestellingen worden handmatig verzonden. [Levertijd nog invullen.]",
      en: "Orders are shipped by hand. [Delivery time to be filled in.]",
    },
  },
];

export const products: Product[] = [
  {
    // Product 1: echte gegevens uit het etiket en de flyer. Prijs en houdbaarheid nog bevestigen.
    slug: "calendulazalf-pakketje",
    name: { nl: "Calendulazalf", en: "Calendula salve" },
    tagline: {
      nl: "Maak je eigen zalf, met bloemen uit het Naardermeer.",
      en: "Make your own salve, with flowers from the Naardermeer.",
    },
    short: {
      nl: "Een Do It Yourself-pakketje met alles om zelf calendulazalf te maken: amandelolie, bijenwas, gedroogde calendulabloemen en een glazen potje.",
      en: "A Do It Yourself kit with everything to make your own calendula salve: almond oil, beeswax, dried calendula flowers and a glass jar.",
    },
    priceCents: 1495, // voorbeeldprijs, nog bevestigen
    size: "Do It Yourself pakketje",
    art: { bg: "#D66211", fg: "#F7F1E8", variant: "leaves" },
    images: [
      {
        src: "/images/product-1/pakketje-doos.jpg",
        alt: {
          nl: "Het Do It Yourself Calendulazalf Pakketje van ANET op een houten plank",
          en: "The ANET Do It Yourself Calendula Salve kit on a wooden shelf",
        },
      },
      {
        src: "/images/product-1/pakketje-inhoud.jpg",
        alt: {
          nl: "De inhoud van het pakketje: bloemen, zaadjes en een glazen potje",
          en: "The contents of the kit: flowers, seeds and a glass jar",
        },
      },
      {
        src: "/images/product-1/etiket.jpg",
        alt: { nl: "Het etiket van het pakketje", en: "The label of the kit" },
      },
    ],
    placeholder: true,
    facts: [
      { label: { nl: "Inhoud", en: "Contents" }, value: { nl: "6 onderdelen", en: "6 parts" } },
      {
        label: { nl: "Herkomst", en: "Origin" },
        value: { nl: "Naardermeer", en: "Naardermeer" },
      },
      { label: { nl: "Houdbaar tot", en: "Best before" }, value: TODO },
      { label: { nl: "Potje", en: "Jar" }, value: { nl: "60 ml glas", en: "60 ml glass" } },
    ],
    story: [
      {
        nl: "Afgelopen zomer bloeiden de goudsbloemen volop in de kruidentuin bij de gemeenschapstuin van Oogst vol Liefde in het Naardermeer. De bloemen zijn met zorg gekweekt, geoogst en gedroogd. Ook de zaadjes in dit pakketje komen van deze bloemen.",
        en: "Last summer the marigolds bloomed abundantly in the herb garden at the Oogst vol Liefde community garden in the Naardermeer. The flowers were carefully grown, harvested and dried. The seeds in this kit come from these flowers too.",
      },
      {
        nl: "Met dit Do It Yourself-pakketje maak je je eigen calendulazalf. En met de bijgeleverde zaadjes kun je komend voorjaar je eigen goudsbloemen kweken.",
        en: "With this Do It Yourself kit you make your own calendula salve. And with the seeds included you can grow your own marigolds next spring.",
      },
    ],
    ingredients: {
      nl: "60 ml amandelolie, 10 g bijenwas, 10 g gedroogde calendulabloemen, 10 g calendulazaadjes, glazen zalfpotje 60 ml en een recept. [Volledige ingrediëntenlijst controleren.]",
      en: "60 ml almond oil, 10 g beeswax, 10 g dried calendula flowers, 10 g calendula seeds, 60 ml glass jar and a recipe. [Check the full ingredient list.]",
    },
    origin: {
      nl: "Bloemen en zaden uit het Naardermeer.",
      en: "Flowers and seeds from the Naardermeer.",
    },
    allergens: { nl: "[nog invullen, o.a. amandel]", en: "[to be filled in, incl. almond]" },
    storage: {
      nl: "Koel, droog en donker bewaren. Buiten bereik van kinderen houden.",
      en: "Store cool, dry and dark. Keep out of reach of children.",
    },
    usage: [
      {
        title: { nl: "Zelf toevoegen", en: "What you add yourself" },
        body: {
          nl: "Een glazen pot, een pannetje en warm water. Het recept zit in het pakketje.",
          en: "A glass jar, a small pan and warm water. The recipe is in the kit.",
        },
      },
      {
        title: { nl: "Let op", en: "Please note" },
        body: {
          nl: "De zelfgemaakte zalf is uitsluitend voor uitwendig gebruik.",
          en: "The salve you make is for external use only.",
        },
      },
    ],
    tip: {
      nl: "Bewaar de zaadjes tot het voorjaar en zaai ze dan zelf uit.",
      en: "Keep the seeds until spring and sow them yourself.",
    },
    faq: commonFaq,
  },
  {
    slug: "gedroogd-brandnetelblad",
    name: { nl: "Gedroogd brandnetelblad", en: "Dried nettle leaf" },
    tagline: { nl: "Voor in soep, saus en brood.", en: "For soup, sauce and bread." },
    short: {
      nl: "Heel of grof gesneden blad als keukenkruid. Voorbeeldtekst.",
      en: "Whole or coarsely cut leaf as a kitchen herb. Example text.",
    },
    priceCents: 495,
    size: "30 g",
    art: { bg: "#000000", fg: "#F0952B", variant: "leaf" },
    placeholder: true,
    facts: commonFacts("30 g"),
    story: [
      {
        nl: "Voorbeeldtekst: vertel hier waarom dit kruid in de keuken thuishoort en hoe jullie het zelf gebruiken.",
      },
    ],
    ingredients: { nl: "Brandnetelblad. [Controleren en aanvullen.]" },
    origin: TODO,
    allergens: TODO,
    storage: { nl: "Droog, koel en donker bewaren. [Controleren.]" },
    usage: [
      {
        title: { nl: "In soep", en: "In soup" },
        body: { nl: "Voorbeeld: strooi een snufje door de soep. [Invullen.]" },
      },
      {
        title: { nl: "In brood", en: "In bread" },
        body: { nl: "Voorbeeld: meekneden in het deeg. [Invullen.]" },
      },
    ],
    tip: { nl: "Voorbeeldtip: fijnwrijven voor je het toevoegt." },
    faq: commonFaq,
  },
  {
    slug: "brandnetelpoeder",
    name: { nl: "Brandnetelpoeder", en: "Nettle powder" },
    tagline: { nl: "Fijn gemalen, makkelijk te doseren.", en: "Finely ground, easy to measure." },
    short: {
      nl: "Fijn gemalen brandnetel voor door smoothies, dips en deeg. Voorbeeldtekst.",
      en: "Finely ground nettle for smoothies, dips and dough. Example text.",
    },
    priceCents: 695,
    size: "75 g",
    art: { bg: "#F7F1E8", fg: "#8A5A2B", variant: "grain" },
    placeholder: true,
    facts: commonFacts("75 g"),
    story: [
      { nl: "Voorbeeldtekst: hier komt het verhaal achter het poeder en hoe het wordt gemalen." },
    ],
    ingredients: { nl: "Brandnetelblad. [Controleren en aanvullen.]" },
    origin: TODO,
    allergens: TODO,
    storage: { nl: "Droog, koel en donker bewaren. [Controleren.]" },
    usage: [
      {
        title: { nl: "In een smoothie", en: "In a smoothie" },
        body: { nl: "Voorbeeld: een theelepel door de blender. [Invullen.]" },
      },
      {
        title: { nl: "In een dip", en: "In a dip" },
        body: { nl: "Voorbeeld: roer door yoghurt of hummus. [Invullen.]" },
      },
    ],
    tip: { nl: "Voorbeeldtip: begin met een kleine hoeveelheid." },
    faq: commonFaq,
  },
  {
    slug: "kruidenmix",
    name: { nl: "Kruidenmix", en: "Herb blend" },
    tagline: { nl: "Een mengsel voor elke dag.", en: "A blend for every day." },
    short: {
      nl: "Een kruidenmengsel met brandnetel. Voorbeeldtekst.",
      en: "A herb blend with nettle. Example text.",
    },
    priceCents: 549,
    size: "40 g",
    art: { bg: "#B98B5E", fg: "#F7F1E8", variant: "sprig" },
    placeholder: true,
    facts: commonFacts("40 g"),
    story: [
      {
        nl: "Voorbeeldtekst: vertel hier uit welke kruiden de mix bestaat en waarom jullie die combinatie kozen.",
      },
    ],
    ingredients: { nl: "[Samenstelling nog invullen.]" },
    origin: TODO,
    allergens: TODO,
    storage: { nl: "Droog, koel en donker bewaren. [Controleren.]" },
    usage: [
      {
        title: { nl: "Bij groenten", en: "With vegetables" },
        body: { nl: "Voorbeeld: over geroosterde groenten. [Invullen.]" },
      },
      {
        title: { nl: "Bij vis of vlees", en: "With fish or meat" },
        body: { nl: "Voorbeeld: als marinade. [Invullen.]" },
      },
    ],
    tip: { nl: "Voorbeeldtip: voeg de mix aan het eind toe voor meer smaak." },
    faq: commonFaq,
  },
  {
    slug: "brandnetelzout",
    name: { nl: "Brandnetelzout", en: "Nettle salt" },
    tagline: { nl: "Zout met een groene draai.", en: "Salt with a green twist." },
    short: {
      nl: "Zout met brandnetel, voor op tafel of in de pan. Voorbeeldtekst.",
      en: "Salt with nettle, for the table or the pan. Example text.",
    },
    priceCents: 450,
    size: "100 g",
    art: { bg: "#EDE3D3", fg: "#B4510C", variant: "drop" },
    placeholder: true,
    facts: commonFacts("100 g"),
    story: [
      { nl: "Voorbeeldtekst: hier komt het verhaal achter dit zout en hoe het wordt gemaakt." },
    ],
    ingredients: { nl: "[Samenstelling nog invullen.]" },
    origin: TODO,
    allergens: TODO,
    storage: { nl: "Droog bewaren. [Controleren.]" },
    usage: [
      {
        title: { nl: "Op tafel", en: "At the table" },
        body: { nl: "Voorbeeld: over een gebakken ei. [Invullen.]" },
      },
      {
        title: { nl: "In de pan", en: "In the pan" },
        body: { nl: "Voorbeeld: door pasta of aardappelen. [Invullen.]" },
      },
    ],
    tip: { nl: "Voorbeeldtip: gebruik het aan het eind van het koken." },
    faq: commonFaq,
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
