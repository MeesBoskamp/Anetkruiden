import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { findProduct, maxOrderable, useCatalog } from "@/lib/catalog";

type CartItem = { slug: string; qty: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "anetkruiden-cart-v1";
const MAX_QTY = 20;

function sanitize(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (i): i is CartItem =>
        !!i &&
        typeof i.slug === "string" &&
        typeof i.qty === "number" &&
        Number.isFinite(i.qty) &&
        i.qty > 0,
    )
    .map((i) => ({ slug: i.slug, qty: Math.min(Math.floor(i.qty), MAX_QTY) }));
}

/**
 * De winkelmand bewaart alleen product en aantal. Prijzen worden altijd opnieuw uit de
 * productgegevens gehaald, en in fase 4 ook op de server herberekend.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const catalog = useCatalog();
  const catalogRef = useRef(catalog);
  catalogRef.current = catalog;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(sanitize(JSON.parse(stored)));
    } catch {
      /* ongeldige of ontbrekende opslag: start met een lege mand */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* negeren */
    }
  }, [items, loaded]);

  const limitFor = useCallback((slug: string) => {
    const product = findProduct(catalogRef.current, slug);
    return product ? maxOrderable(product, MAX_QTY) : 0;
  }, []);

  const add = useCallback(
    (slug: string, qty = 1) => {
      const limit = limitFor(slug);
      if (limit <= 0) return;
      setItems((prev) => {
        const existing = prev.find((i) => i.slug === slug);
        if (existing) {
          return prev.map((i) =>
            i.slug === slug ? { ...i, qty: Math.min(i.qty + qty, limit) } : i,
          );
        }
        return [...prev, { slug, qty: Math.min(qty, limit) }];
      });
      setOpen(true);
    },
    [limitFor],
  );

  const setQty = useCallback(
    (slug: string, qty: number) => {
      const limit = limitFor(slug);
      setItems((prev) =>
        qty <= 0
          ? prev.filter((i) => i.slug !== slug)
          : prev.map((i) => (i.slug === slug ? { ...i, qty: Math.min(qty, limit) } : i)),
      );
    },
    [limitFor],
  );

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    // Alleen producten die (nog) in de winkel staan tellen mee; aantallen nooit boven de voorraad.
    const visible = items.flatMap((i) => {
      const product = findProduct(catalog, i.slug);
      if (!product) return [];
      const qty = Math.min(i.qty, maxOrderable(product, MAX_QTY));
      return qty > 0 ? [{ slug: i.slug, qty, priceCents: product.priceCents }] : [];
    });
    const count = visible.reduce((sum, i) => sum + i.qty, 0);
    const subtotalCents = visible.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
    return {
      items: visible.map(({ slug, qty }) => ({ slug, qty })),
      count,
      subtotalCents,
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
    };
  }, [items, catalog, open, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart moet binnen CartProvider gebruikt worden");
  return ctx;
}
