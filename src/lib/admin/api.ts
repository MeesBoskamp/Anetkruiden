import type { DbProduct } from "@/lib/catalog";
import { getSupabase, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase";

/* ─────────────────────────────── Bestellingen ─────────────────────────────── */

export const ORDER_STATUSES = [
  "aangemaakt",
  "betaald",
  "in_behandeling",
  "klaar_voor_verzending",
  "verzonden",
  "geannuleerd",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  aangemaakt: "Aangemaakt",
  betaald: "Betaald",
  in_behandeling: "In behandeling",
  klaar_voor_verzending: "Klaar voor verzending",
  verzonden: "Verzonden",
  geannuleerd: "Geannuleerd",
};

export const STATUS_HELP: Record<OrderStatus, string> = {
  aangemaakt: "Bestelling is geplaatst, maar nog niet betaald.",
  betaald: "Betaling is binnen. Klaar om in te pakken.",
  in_behandeling: "Ik ben de bestelling aan het inpakken.",
  klaar_voor_verzending: "Ingepakt en klaar om weg te brengen.",
  verzonden: "Onderweg naar de klant.",
  geannuleerd: "Geannuleerd. De voorraad is teruggezet.",
};

/** Kleur per status (Tailwind-klassen). */
export const STATUS_STYLE: Record<OrderStatus, string> = {
  aangemaakt: "bg-muted text-foreground",
  betaald: "bg-calendula/25 text-ink",
  in_behandeling: "bg-brand/20 text-ink",
  klaar_voor_verzending: "bg-brand-deep text-white",
  verzonden: "bg-ink text-white",
  geannuleerd: "bg-transparent text-muted-foreground line-through border border-border",
};

/** Statussen die nog werk vragen: betaald tot en met klaar voor verzending. */
export const TO_SHIP: OrderStatus[] = ["betaald", "in_behandeling", "klaar_voor_verzending"];

export type Order = {
  id: string;
  order_number: number;
  status: OrderStatus;
  is_test: boolean;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  company_name: string | null;
  street: string;
  house_number: string;
  house_number_addition: string | null;
  postal_code: string;
  city: string;
  country: string;
  customer_note: string | null;
  newsletter_opt_in: boolean;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  payment_provider: string | null;
  payment_id: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  track_and_trace: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  unit_price_cents: number;
  quantity: number;
};

export type OrderEvent = {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
};

export type OrderWithItems = Order & { anet_order_items: OrderItem[] };

function db() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("De database is niet gekoppeld.");
  return supabase;
}

export async function listOrders(): Promise<OrderWithItems[]> {
  const { data, error } = await db()
    .from("anet_orders")
    .select("*, anet_order_items(*)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data as OrderWithItems[];
}

export async function getOrder(id: string) {
  const supabase = db();
  const [order, events] = await Promise.all([
    supabase.from("anet_orders").select("*, anet_order_items(*)").eq("id", id).single(),
    supabase
      .from("anet_order_events")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true }),
  ]);
  if (order.error) throw order.error;
  if (events.error) throw events.error;
  return { order: order.data as OrderWithItems, events: events.data as OrderEvent[] };
}

export async function updateOrder(
  id: string,
  patch: Partial<Pick<Order, "status" | "track_and_trace" | "admin_note">>,
) {
  const { error } = await db().from("anet_orders").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteOrder(id: string) {
  const { error } = await db().from("anet_orders").delete().eq("id", id);
  if (error) throw error;
}

export type NewOrderInput = {
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    company_name?: string;
    street: string;
    house_number: string;
    house_number_addition?: string;
    postal_code: string;
    city: string;
    customer_note?: string;
  };
  items: { product_id: string; quantity: number }[];
  test: boolean;
};

export async function createOrder(input: NewOrderInput): Promise<string> {
  const { data, error } = await db().rpc("anet_create_order", {
    customer: input.customer,
    items: input.items,
    test: input.test,
  });
  if (error) throw error;
  return data as string;
}

/* ──────────────────────────────── Producten ──────────────────────────────── */

/** Vanaf dit aantal (en lager) geldt een product als "bijna op". */
export const LOW_STOCK = 3;

export async function listAdminProducts(): Promise<DbProduct[]> {
  const { data, error } = await db()
    .from("anet_products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as DbProduct[];
}

export async function getAdminProduct(id: string): Promise<DbProduct> {
  const { data, error } = await db().from("anet_products").select("*").eq("id", id).single();
  if (error) throw error;
  return data as DbProduct;
}

export type ProductInput = Omit<DbProduct, "id" | "created_at" | "updated_at">;

export async function saveProduct(id: string | null, input: ProductInput): Promise<string> {
  const supabase = db();
  if (id) {
    const { error } = await supabase.from("anet_products").update(input).eq("id", id);
    if (error) throw error;
    return id;
  }
  const { data, error } = await supabase.from("anet_products").insert(input).select("id").single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function updateProductFields(id: string, patch: Partial<ProductInput>) {
  const { error } = await db().from("anet_products").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await db().from("anet_products").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderProducts(ids: string[]) {
  const { error } = await db().rpc("anet_reorder_products", { ids });
  if (error) throw error;
}

/** Verkleint een foto in de browser (max. 1600 px) en uploadt hem. Geeft de openbare URL terug. */
export async function uploadProductImage(file: File): Promise<string> {
  const supabase = db();
  const blob = await shrinkImage(file, 1600);
  const ext = blob.type === "image/png" ? "png" : "jpg";
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, blob, {
    contentType: blob.type,
    cacheControl: "31536000",
  });
  if (error) throw error;
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function shrinkImage(file: File, maxSize: number): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Dit bestand is geen afbeelding.");
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

/* ────────────────────────────────── Hulp ─────────────────────────────────── */

/** Foutmelding uit Supabase leesbaar maken. */
export function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const msg = String((err as { message: unknown }).message);
    if (msg.includes("anet_products_slug_key")) return "Deze URL-naam (slug) bestaat al.";
    if (msg.includes("anet_zichtbaar_product_heeft_foto"))
      return "Een zichtbaar product heeft minimaal één foto nodig.";
    if (msg.includes("violates foreign key")) return "Dit item wordt nog ergens gebruikt.";
    return msg;
  }
  return "Er ging iets mis.";
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** "14,95" of "14.95" → 1495. Geeft null bij een ongeldig bedrag. */
export function parseEuro(input: string): number | null {
  const clean = input
    .replace(/[€\s]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(parseFloat(clean) * 100);
}

export function centsToInput(cents: number | null | undefined) {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

const dateFmt = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
export function formatDateTime(iso: string | null | undefined) {
  return iso ? dateFmt.format(new Date(iso)) : "";
}
