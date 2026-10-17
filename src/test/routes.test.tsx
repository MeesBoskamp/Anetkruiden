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
  it("heeft 5 producten met unieke slugs en prijs in centen", () => {
    expect(products).toHaveLength(5);
    expect(new Set(products.map((p) => p.slug)).size).toBe(5);
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
