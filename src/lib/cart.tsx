import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getProduct } from "@/content/products";

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
        i.qty > 0 &&
        !!getProduct(i.slug),
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

  const add = useCallback((slug: string, qty = 1) => {
    if (!getProduct(slug)) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === slug);
      if (existing) {
        return prev.map((i) =>
          i.slug === slug ? { ...i, qty: Math.min(i.qty + qty, MAX_QTY) } : i,
        );
      }
      return [...prev, { slug, qty: Math.min(qty, MAX_QTY) }];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) => (i.slug === slug ? { ...i, qty: Math.min(qty, MAX_QTY) } : i)),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotalCents = items.reduce(
      (sum, i) => sum + (getProduct(i.slug)?.priceCents ?? 0) * i.qty,
      0,
    );
    return { items, count, subtotalCents, open, setOpen, add, setQty, remove, clear };
  }, [items, open, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart moet binnen CartProvider gebruikt worden");
  return ctx;
}
