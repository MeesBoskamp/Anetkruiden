import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { getProduct, products } from "@/content/products";
import { formatPrice } from "@/lib/format";
import { routeTree } from "@/routeTree.gen";

const router = () => createRouter({ routeTree, context: { queryClient: new QueryClient() } });

describe("Pagina's", () => {
  const paths = [
    "/",
    "/shop",
    "/over-ons",
    "/contact",
    "/faq",
    "/verzending-en-retour",
    "/algemene-voorwaarden",
    "/privacy",
    "/beheer",
    "/beheer/bestellingen",
    "/beheer/bestellingen/abc",
    "/beheer/voorraad",
    "/beheer/producten",
    "/beheer/producten/nieuw",
    ...products.map((p) => `/producten/${p.slug}`),
  ];

  it.each(paths)("%s heeft een eigen pagina", (path) => {
    const matches = router().matchRoutes(path);
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("onbekende paden vallen terug op 404", () => {
    const matches = router().matchRoutes("/bestaat-niet");
    expect(matches.at(-1)?.routeId).toBe(rootRouteId);
  });
});

describe("Producten", () => {
  it("heeft 6 producten met unieke slugs en prijs in centen", () => {
    expect(products).toHaveLength(6);
    expect(new Set(products.map((p) => p.slug)).size).toBe(6);
    for (const p of products) {
      expect(Number.isInteger(p.priceCents)).toBe(true);
      expect(p.priceCents).toBeGreaterThan(0);
      expect(getProduct(p.slug)).toBe(p);
    }
  });

  it("toont bedragen in euro's", () => {
    expect(formatPrice(595)).toContain("5,95");
  });
});

describe("Beheer-hulpfuncties", () => {
  it("leest bedragen in euro's", async () => {
    const { parseEuro, centsToInput, slugify } = await import("@/lib/admin/api");
    expect(parseEuro("14,95")).toBe(1495);
    expect(parseEuro("€ 4.95")).toBe(495);
    expect(parseEuro("7")).toBe(700);
    expect(parseEuro("abc")).toBeNull();
    expect(centsToInput(1495)).toBe("14,95");
    expect(slugify("Calendulazalf Pakketje!")).toBe("calendulazalf-pakketje");
    expect(slugify("Crème brûlée")).toBe("creme-brulee");
  });
});

describe("Catalogus uit de database", () => {
  it("laat lege velden weg en toont uitverkocht", async () => {
    const { fromDb, isSoldOut } = await import("@/lib/catalog");
    const p = fromDb({
      id: "1",
      slug: "test",
      name: "Test",
      short_description: "Beschrijving",
      price_cents: 495,
      stock: 0,
      images: [{ url: "/a.jpg", alt: null }],
      sort_order: 1,
      is_visible: true,
      is_example: false,
      badge: " ",
      tagline: null,
      size: "",
      compare_at_price_cents: 300,
      story: "Eerste alinea.\n\nTweede alinea.",
      facts: [{ label: "Inhoud", value: "" }],
      contents: [],
      about_title: null,
      about_body: null,
      ingredients: "",
      allergens: null,
      origin: null,
      storage: null,
      packaging: null,
      usage: [],
      tip: null,
      faq: [{ q: "Vraag?", a: "Antwoord." }],
      weight_grams: null,
      seo_title: null,
      seo_description: null,
      animation: null,
      animation_labels: [],
      created_at: "",
      updated_at: "",
    });
    expect(p.tagline).toBeUndefined();
    expect(p.size).toBeUndefined();
    expect(p.badge).toBeUndefined();
    expect(p.compareAtCents).toBeUndefined();
    expect(p.story).toHaveLength(2);
    expect(p.facts).toHaveLength(0);
    expect(p.ingredients).toBeUndefined();
    expect(p.images?.[0]?.alt.nl).toBe("Test");
    expect(p.faq).toHaveLength(1);
    expect(isSoldOut(p)).toBe(true);
  });
});
