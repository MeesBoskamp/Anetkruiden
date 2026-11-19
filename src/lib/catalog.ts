import { queryOptions, useQuery } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";

import { products as fallbackProducts, type Product } from "@/content/products";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

/** Een product zoals het in de database staat (tabel anet_products). */
export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  price_cents: number;
  stock: number;
  images: { url: string; alt?: string | null }[];
  sort_order: number;
  is_visible: boolean;
  is_example: boolean;
  badge: string | null;
  tagline: string | null;
  size: string | null;
  compare_at_price_cents: number | null;
  story: string | null;
  facts: { label: string; value: string }[];
  contents: { amount: string; item: string }[];
  about_title: string | null;
  about_body: string | null;
  ingredients: string | null;
  allergens: string | null;
  origin: string | null;
  storage: string | null;
  packaging: string | null;
  usage: { title: string; body: string }[];
  tip: string | null;
  faq: { q: string; a: string }[];
  weight_grams: number | null;
  seo_title: string | null;
  seo_description: string | null;
  /** Productanimatie bovenaan de pagina (null = alleen foto's). */
  /** Ontbreekt zolang migratie 20261119090000_productanimatie nog niet is uitgevoerd. */
  animation?: "kamille" | null;
  animation_labels?: string[];
  created_at: string;
  updated_at: string;
};

const ART_CYCLE: Product["art"][] = [
  { bg: "#D66211", fg: "#F7F1E8", variant: "leaves" },
  { bg: "#000000", fg: "#F0952B", variant: "leaf" },
  { bg: "#F7F1E8", fg: "#8A5A2B", variant: "grain" },
  { bg: "#B98B5E", fg: "#F7F1E8", variant: "sprig" },
  { bg: "#EDE3D3", fg: "#B4510C", variant: "drop" },
];

const filled = (s: string | null | undefined): s is string => !!s && s.trim().length > 0;
const text = (s: string | null | undefined) => (filled(s) ? { nl: s.trim() } : undefined);
const paragraphs = (s: string | null | undefined) =>
  filled(s)
    ? s
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((nl) => ({ nl }))
    : [];

/** Zet een databaseregel om naar de vorm die de website gebruikt. Lege velden vallen weg. */
export function fromDb(row: DbProduct, index = 0): Product {
  const aboutBody = paragraphs(row.about_body);
  return {
    id: row.id,
    slug: row.slug,
    name: { nl: row.name },
    tagline: text(row.tagline),
    short: { nl: row.short_description },
    priceCents: row.price_cents,
    compareAtCents:
      row.compare_at_price_cents && row.compare_at_price_cents > row.price_cents
        ? row.compare_at_price_cents
        : undefined,
    size: filled(row.size) ? row.size.trim() : undefined,
    stock: row.stock,
    badge: filled(row.badge) ? row.badge.trim() : undefined,
    art: ART_CYCLE[index % ART_CYCLE.length] ?? ART_CYCLE[0]!,
    images: (row.images ?? [])
      .filter((im) => filled(im?.url))
      .map((im) => ({ src: im.url, alt: { nl: filled(im.alt) ? im.alt : row.name } })),
    animation: row.animation
      ? {
          kind: row.animation,
          labels: (row.animation_labels ?? []).filter(filled).map((nl) => ({ nl: nl.trim() })),
        }
      : undefined,
    placeholder: row.is_example,
    facts: (row.facts ?? [])
      .filter((f) => filled(f?.label) && filled(f?.value))
      .map((f) => ({ label: { nl: f.label }, value: { nl: f.value } })),
    story: paragraphs(row.story),
    contents: (row.contents ?? [])
      .filter((c) => filled(c?.item))
      .map((c) => ({ amount: c.amount ?? "", item: { nl: c.item } })),
    about:
      aboutBody.length > 0
        ? {
            title: { nl: filled(row.about_title) ? row.about_title : `Over ${row.name}` },
            body: aboutBody,
          }
        : undefined,
    ingredients: text(row.ingredients),
    allergens: text(row.allergens),
    origin: text(row.origin),
    storage: text(row.storage),
    packaging: text(row.packaging),
    usage: (row.usage ?? [])
      .filter((u) => filled(u?.title) || filled(u?.body))
      .map((u) => ({ title: { nl: u.title ?? "" }, body: { nl: u.body ?? "" } })),
    tip: text(row.tip),
    faq: (row.faq ?? [])
      .filter((f) => filled(f?.q) && filled(f?.a))
      .map((f) => ({ q: { nl: f.q }, a: { nl: f.a } })),
    seoTitle: filled(row.seo_title) ? row.seo_title : undefined,
    seoDescription: filled(row.seo_description) ? row.seo_description : undefined,
  };
}

export type Catalog = {
  products: Product[];
  /** false = de database was niet bereikbaar en de reservelijst wordt getoond. */
  live: boolean;
};

/** Haalt de zichtbare producten op, in de volgorde uit het beheer. Valt terug op de reservelijst. */
export async function fetchCatalog(): Promise<Catalog> {
  const supabase = getSupabase();
  if (!supabase) return { products: fallbackProducts, live: false };
  try {
    const { data, error } = await supabase
      .from("anet_products")
      .select("*")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return { products: (data as DbProduct[]).map(fromDb), live: true };
  } catch (err) {
    console.error("Producten konden niet worden geladen; reservelijst gebruikt.", err);
    return { products: fallbackProducts, live: false };
  }
}

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: fetchCatalog,
  staleTime: 60_000,
});

/** Alle zichtbare producten (lege lijst tijdens het laden). */
export function useCatalog(): Product[] {
  // De root-loader haalt de catalogus al op (ook bij server-rendering); dat is de startwaarde.
  const initial = useLoaderData({ from: "__root__", select: (d) => d.catalog });
  // Kwam de reservelijst uit de server, dan direct opnieuw proberen in de browser.
  const { data } = useQuery({
    ...catalogQuery,
    initialData: initial,
    ...(initial && !initial.live && supabaseConfigured ? { initialDataUpdatedAt: 0 } : {}),
  });
  return data?.products ?? [];
}

export function findProduct(list: Product[], slug: string) {
  return list.find((p) => p.slug === slug);
}

export function isSoldOut(product: Product) {
  return typeof product.stock === "number" && product.stock <= 0;
}

/** Hoeveel er maximaal in de winkelmand mag (voorraad, met een bovengrens). */
export function maxOrderable(product: Product, cap = 20) {
  return typeof product.stock === "number" ? Math.max(0, Math.min(product.stock, cap)) : cap;
}
