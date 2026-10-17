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
    slug: "brandnetelthee",
    name: { nl: "Brandnetelthee", en: "Nettle tea" },
    tagline: { nl: "Een rustig kopje, helemaal groen.", en: "A calm cup, all green." },
    short: {
      nl: "Gedroogde brandnetelblaadjes voor een kop kruidenthee. Voorbeeldtekst.",
      en: "Dried nettle leaves for a cup of herbal tea. Example text.",
    },
    priceCents: 595,
    size: "50 g",
    art: { bg: "#1F4D2E", fg: "#7FB069", variant: "leaves" },
    placeholder: true,
    facts: commonFacts("50 g"),
    story: [
      {
        nl: "Brandnetel groeit bijna overal en wordt al lang gebruikt als kruid. Dit is voorbeeldtekst: hier komt het verhaal achter dit product, hoe het wordt geplukt, gedroogd en verpakt.",
      },
      {
        nl: "Vervang deze alinea door jullie eigen verhaal. Houd het kort, concreet en persoonlijk.",
      },
    ],
    ingredients: {
      nl: "Brandnetelblad. [Controleren en aanvullen.]",
      en: "Nettle leaf. [To be checked.]",
    },
    origin: TODO,
    allergens: { nl: "[nog invullen]", en: "[to be filled in]" },
    storage: { nl: "Droog, koel en donker bewaren. [Controleren.]" },
    usage: [
      {
        title: { nl: "Als thee", en: "As tea" },
        body: {
          nl: "Overgiet met heet water en laat even trekken. [Hoeveelheid en tijd invullen.]",
        },
      },
      {
        title: { nl: "In de keuken", en: "In the kitchen" },
        body: { nl: "Voorbeeld: door soep of een kruidenmengsel. [Eigen idee invullen.]" },
      },
    ],
    tip: {
      nl: "Voorbeeldtip: bewaar de thee in een afgesloten bus.",
      en: "Example tip: keep the tea in a sealed tin.",
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
    art: { bg: "#0F1A14", fg: "#7FB069", variant: "leaf" },
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
    art: { bg: "#E9E6DB", fg: "#1F4D2E", variant: "grain" },
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
    art: { bg: "#B5532B", fg: "#F5F3EC", variant: "sprig" },
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
    art: { bg: "#F5F3EC", fg: "#B5532B", variant: "drop" },
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
