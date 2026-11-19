import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { ImageEditor, type ImageItem } from "@/components/admin/ImageEditor";
import { ListEditor } from "@/components/admin/ListEditor";
import { DEFAULT_BAG_LABELS } from "@/components/site/BagAnimation";
import {
  AdminPage,
  adminBtn,
  ErrorNote,
  Field,
  inputClass,
  Loading,
  Panel,
} from "@/components/admin/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import {
  centsToInput,
  deleteProduct,
  errorMessage,
  getAdminProduct,
  listAdminProducts,
  parseEuro,
  saveProduct,
  slugify,
  type ProductInput,
} from "@/lib/admin/api";
import type { DbProduct } from "@/lib/catalog";

export const Route = createFileRoute("/beheer/producten/$id")({
  component: ProductEditorPage,
});

type Form = {
  name: string;
  slug: string;
  short_description: string;
  price: string;
  stock: string;
  images: ImageItem[];
  is_visible: boolean;
  is_example: boolean;
  badge: string;
  compare_at: string;
  tagline: string;
  size: string;
  story: string;
  facts: { label: string; value: string }[];
  contents: { amount: string; item: string }[];
  about_title: string;
  about_body: string;
  ingredients: string;
  allergens: string;
  origin: string;
  storage: string;
  packaging: string;
  usage: { title: string; body: string }[];
  tip: string;
  faq: { q: string; a: string }[];
  weight_grams: string;
  seo_title: string;
  seo_description: string;
  animation: "" | "kamille";
  animation_labels: { text: string }[];
  /** false zolang de animatiekolommen nog niet in de database staan. */
  animation_column: boolean;
};

const blank: Form = {
  name: "",
  slug: "",
  short_description: "",
  price: "",
  stock: "0",
  images: [],
  is_visible: true,
  is_example: false,
  badge: "",
  compare_at: "",
  tagline: "",
  size: "",
  story: "",
  facts: [],
  contents: [],
  about_title: "",
  about_body: "",
  ingredients: "",
  allergens: "",
  origin: "",
  storage: "",
  packaging: "",
  usage: [],
  tip: "",
  faq: [],
  weight_grams: "",
  seo_title: "",
  seo_description: "",
  animation: "",
  animation_labels: [],
  animation_column: false,
};

function toForm(p: DbProduct): Form {
  return {
    name: p.name,
    slug: p.slug,
    short_description: p.short_description,
    price: centsToInput(p.price_cents),
    stock: String(p.stock),
    images: (p.images ?? []).map((im) => ({ url: im.url, alt: im.alt ?? "" })),
    is_visible: p.is_visible,
    is_example: p.is_example,
    badge: p.badge ?? "",
    compare_at: centsToInput(p.compare_at_price_cents),
    tagline: p.tagline ?? "",
    size: p.size ?? "",
    story: p.story ?? "",
    facts: p.facts ?? [],
    contents: p.contents ?? [],
    about_title: p.about_title ?? "",
    about_body: p.about_body ?? "",
    ingredients: p.ingredients ?? "",
    allergens: p.allergens ?? "",
    origin: p.origin ?? "",
    storage: p.storage ?? "",
    packaging: p.packaging ?? "",
    usage: p.usage ?? [],
    tip: p.tip ?? "",
    faq: p.faq ?? [],
    weight_grams: p.weight_grams ? String(p.weight_grams) : "",
    seo_title: p.seo_title ?? "",
    seo_description: p.seo_description ?? "",
    animation: p.animation ?? "",
    animation_labels: (p.animation_labels ?? []).map((text) => ({ text })),
    animation_column: "animation" in p,
  };
}

type Errors = Partial<Record<keyof Form, string>>;

const opt = (s: string) => (s.trim() ? s.trim() : null);

function validate(f: Form): { errors: Errors; input?: Omit<ProductInput, "sort_order"> } {
  const errors: Errors = {};
  if (!f.name.trim()) errors.name = "Vul een naam in.";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.slug))
    errors.slug = "Alleen kleine letters, cijfers en streepjes.";
  if (!f.short_description.trim()) errors.short_description = "Vul een beschrijving in.";
  const price = parseEuro(f.price);
  if (!price || price <= 0) errors.price = "Vul een geldige prijs in, bijv. 14,95.";
  const stock = Number(f.stock);
  if (f.stock.trim() === "" || !Number.isInteger(stock) || stock < 0)
    errors.stock = "Vul een aantal in (0 of meer).";
  if (f.images.length === 0) errors.images = "Voeg minimaal één foto toe.";
  const compare = f.compare_at.trim() ? parseEuro(f.compare_at) : null;
  if (f.compare_at.trim() && (!compare || (price && compare <= price)))
    errors.compare_at = "De van-prijs moet hoger zijn dan de prijs.";
  const weight = f.weight_grams.trim() ? Number(f.weight_grams) : null;
  if (weight !== null && (!Number.isInteger(weight) || weight <= 0))
    errors.weight_grams = "Hele grammen.";
  if (Object.keys(errors).length) return { errors };

  const clean = <T extends Record<string, string>>(rows: T[], keys: (keyof T)[]) =>
    rows
      .map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.trim()])) as T)
      .filter((r) => keys.some((k) => r[k]));

  return {
    errors,
    input: {
      name: f.name.trim(),
      slug: f.slug,
      short_description: f.short_description.trim(),
      price_cents: price!,
      stock,
      images: f.images.map((im) => ({ url: im.url, alt: im.alt.trim() || null })),
      is_visible: f.is_visible,
      is_example: f.is_example,
      badge: opt(f.badge),
      compare_at_price_cents: compare,
      tagline: opt(f.tagline),
      size: opt(f.size),
      story: opt(f.story),
      facts: clean(f.facts, ["label", "value"]).filter((r) => r.label && r.value),
      contents: clean(f.contents, ["item"]),
      about_title: opt(f.about_title),
      about_body: opt(f.about_body),
      ingredients: opt(f.ingredients),
      allergens: opt(f.allergens),
      origin: opt(f.origin),
      storage: opt(f.storage),
      packaging: opt(f.packaging),
      usage: clean(f.usage, ["title", "body"]),
      tip: opt(f.tip),
      faq: clean(f.faq, ["q", "a"]).filter((r) => r.q && r.a),
      weight_grams: weight,
      seo_title: opt(f.seo_title),
      seo_description: opt(f.seo_description),
      // Alleen meesturen als de kolommen bestaan (of als er echt een animatie is gekozen).
      ...(f.animation_column || f.animation
        ? {
            animation: f.animation || null,
            animation_labels: f.animation
              ? f.animation_labels.map((l) => l.text.trim()).filter(Boolean)
              : [],
          }
        : {}),
    },
  };
}

function ProductEditorPage() {
  const { id } = Route.useParams();
  const isNew = id === "nieuw";
  const query = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => getAdminProduct(id),
    enabled: !isNew,
  });

  if (!isNew && query.isPending) return <Loading />;
  if (!isNew && query.error) {
    return (
      <AdminPage title="Product">
        <ErrorNote>{errorMessage(query.error)}</ErrorNote>
      </AdminPage>
    );
  }
  return <ProductEditor key={id} product={isNew ? null : (query.data ?? null)} />;
}

function ProductEditor({ product }: { product: DbProduct | null }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(() => (product ? toForm(product) : blank));
  const [errors, setErrors] = useState<Errors>({});
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Waarschuwen bij weggaan met niet-opgeslagen wijzigingen.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setDirty(true);
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["admin"] }),
      qc.invalidateQueries({ queryKey: ["catalog"] }),
    ]);

  const save = useMutation({
    mutationFn: async (input: Omit<ProductInput, "sort_order">) => {
      if (product) return saveProduct(product.id, { ...input, sort_order: product.sort_order });
      // Nieuw product komt onderaan de lijst.
      const all = await listAdminProducts();
      const last = all.reduce((m, p) => Math.max(m, p.sort_order), 0);
      return saveProduct(null, { ...input, sort_order: last + 1 });
    },
    onSuccess: async (newId) => {
      setDirty(false);
      await refresh();
      toast.success(product ? "Product opgeslagen" : "Product toegevoegd");
      if (!product) navigate({ to: "/beheer/producten/$id", params: { id: newId }, replace: true });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: () => deleteProduct(product!.id),
    onSuccess: async () => {
      setDirty(false);
      await refresh();
      toast.success("Product verwijderd");
      navigate({ to: "/beheer/producten" });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    const { errors, input } = validate(form);
    setErrors(errors);
    if (!input) {
      toast.error("Nog niet alle verplichte velden zijn goed ingevuld.");
      const first = Object.keys(errors)[0];
      document
        .getElementById(`f-${first}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    save.mutate(input);
  }

  const txt = (
    key: keyof Form,
    props: {
      placeholder?: string;
      rows?: number;
      type?: string;
      inputMode?: "decimal" | "numeric";
    } = {},
  ) =>
    props.rows ? (
      <textarea
        id={`f-${key}`}
        rows={props.rows}
        value={form[key] as string}
        placeholder={props.placeholder}
        onChange={(e) => set(key, e.target.value as never)}
        aria-invalid={!!errors[key]}
        className={inputClass}
      />
    ) : (
      <input
        id={`f-${key}`}
        type={props.type ?? "text"}
        inputMode={props.inputMode}
        value={form[key] as string}
        placeholder={props.placeholder}
        onChange={(e) => set(key, e.target.value as never)}
        aria-invalid={!!errors[key]}
        className={inputClass}
      />
    );

  return (
    <form onSubmit={submit} noValidate>
      <AdminPage
        title={product ? product.name : "Nieuw product"}
        description={
          <>
            Velden met <span className="text-brand-deep">*</span> zijn verplicht. Alle andere velden
            zijn optioneel: wat je leeg laat, wordt op de website niet getoond.
          </>
        }
        actions={
          <>
            <Link to="/beheer/producten" className={adminBtn.secondary}>
              <ArrowLeft className="size-4" /> Producten
            </Link>
            {product?.is_visible && (
              <a
                href={`/producten/${product.slug}`}
                target="_blank"
                rel="noreferrer"
                className={adminBtn.secondary}
              >
                <ExternalLink className="size-4" /> Bekijk
              </a>
            )}
          </>
        }
      >
        <div className="space-y-6">
          <Panel title="Basis" description="De gegevens die elk product nodig heeft.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Naam" htmlFor="f-name" required error={errors.name}>
                {txt("name", { placeholder: "Bijv. Calendulazalf" })}
              </Field>
              <Field
                label="Adres op de website"
                htmlFor="f-slug"
                required
                error={errors.slug}
                hint={`anetkruiden.nl/producten/${form.slug || "…"}`}
              >
                <input
                  id="f-slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", slugify(e.target.value));
                  }}
                  className={inputClass}
                />
              </Field>
              <Field
                label="Beschrijving"
                htmlFor="f-short_description"
                required
                error={errors.short_description}
                hint="Korte tekst bovenaan de productpagina en in zoekmachines (2 à 3 zinnen)."
                className="sm:col-span-2"
              >
                {txt("short_description", { rows: 3 })}
              </Field>
              <Field label="Prijs (€)" htmlFor="f-price" required error={errors.price}>
                {txt("price", { placeholder: "14,95", inputMode: "decimal" })}
              </Field>
              <Field
                label="Voorraad"
                htmlFor="f-stock"
                required
                error={errors.stock}
                hint="0 = uitverkocht"
              >
                {txt("stock", { type: "number", inputMode: "numeric" })}
              </Field>
            </div>
            <div className="mt-6" id="f-images">
              <Field
                label="Foto's"
                required
                error={errors.images}
                hint="De eerste foto is de hoofdfoto in de shop."
              >
                <ImageEditor
                  value={form.images}
                  onChange={(v) => set("images", v)}
                  invalid={!!errors.images}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Weergave">
            <div className="grid gap-5 sm:grid-cols-2">
              <Toggle
                label="Zichtbaar op de website"
                hint="Uit = verborgen voor bezoekers, maar bewaard in het beheer."
                checked={form.is_visible}
                onChange={(v) => set("is_visible", v)}
              />
              <Toggle
                label="Label “Voorbeeldproduct”"
                hint="Voor producten met tijdelijke teksten of prijzen."
                checked={form.is_example}
                onChange={(v) => set("is_example", v)}
              />
              <Field
                label="Eigen label"
                htmlFor="f-badge"
                hint="Bijv. Nieuw, Beperkte oplage of Seizoensproduct."
              >
                {txt("badge")}
              </Field>
              <Field
                label="Van-prijs (€)"
                htmlFor="f-compare_at"
                error={errors.compare_at}
                hint="Doorgestreept naast de prijs, voor een aanbieding."
              >
                {txt("compare_at", { inputMode: "decimal" })}
              </Field>
            </div>
          </Panel>

          <Panel
            title="Presentatie"
            description="De opbouw van de productpagina, van boven naar beneden."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Ondertitel" htmlFor="f-tagline" hint="Eén regel onder de naam.">
                {txt("tagline")}
              </Field>
              <Field
                label="Inhoud of formaat"
                htmlFor="f-size"
                hint="Naast de prijs, bijv. 10 g of 100 ml."
              >
                {txt("size")}
              </Field>
            </div>
            <Section
              title="Animatie bovenaan"
              hint="Een draaiende kraftzak met venster en de knop “Ingrediënten”. De foto's komen dan onder de animatie."
            >
              <div className="grid gap-3">
                <select
                  aria-label="Animatie"
                  value={form.animation}
                  onChange={(e) => {
                    const v = e.target.value as Form["animation"];
                    set("animation", v);
                    if (v && form.animation_labels.length === 0)
                      set(
                        "animation_labels",
                        DEFAULT_BAG_LABELS[v].map((text) => ({ text })),
                      );
                  }}
                  className={inputClass}
                >
                  <option value="">Geen animatie (alleen foto's)</option>
                  <option value="kamille">Kraftzak met kamille</option>
                </select>
                {form.animation && (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Teksten naast de zak na een klik op “Ingrediënten”. De eerste helft staat
                      links, de rest rechts. Zet **sterretjes** om een woord voor vetgedrukt.
                      Maximaal 6.
                    </p>
                    <ListEditor
                      value={form.animation_labels}
                      onChange={(v) => set("animation_labels", v)}
                      columns={[{ key: "text", label: "Tekst", placeholder: "Hele bloemhoofdjes" }]}
                      empty={{ text: "" }}
                      addLabel="Tekst toevoegen"
                      max={6}
                    />
                  </>
                )}
              </div>
            </Section>
            <Section
              title="Kenmerken"
              hint="Blokjes onder de foto, bijv. Inhoud: 6 onderdelen. Maximaal 4."
            >
              <ListEditor
                value={form.facts}
                onChange={(v) => set("facts", v)}
                columns={[
                  { key: "label", label: "Kenmerk", placeholder: "Herkomst", span: 2 },
                  { key: "value", label: "Waarde", placeholder: "Naardermeer", span: 4 },
                ]}
                empty={{ label: "", value: "" }}
                addLabel="Kenmerk toevoegen"
                max={4}
              />
            </Section>
            <Section
              title="Het verhaal van dit product"
              hint="Laat een lege regel tussen alinea's."
            >
              {txt("story", { rows: 5 })}
            </Section>
            <Section title="Inhoud van het pakket" hint="Wat er precies in zit, met hoeveelheid.">
              <ListEditor
                value={form.contents}
                onChange={(v) => set("contents", v)}
                columns={[
                  { key: "amount", label: "Hoeveelheid", placeholder: "100 ml", span: 2 },
                  { key: "item", label: "Onderdeel", placeholder: "amandelolie", span: 4 },
                ]}
                empty={{ amount: "", item: "" }}
                addLabel="Onderdeel toevoegen"
              />
            </Section>
            <Section
              title="Achtergrond (donker blok)"
              hint="Bijv. “Over calendula”. Let op: geen medische claims."
            >
              <div className="grid gap-3">
                <input
                  aria-label="Titel achtergrond"
                  placeholder="Titel, bijv. Over calendula"
                  value={form.about_title}
                  onChange={(e) => set("about_title", e.target.value)}
                  className={inputClass}
                />
                <textarea
                  aria-label="Tekst achtergrond"
                  rows={4}
                  value={form.about_body}
                  onChange={(e) => set("about_body", e.target.value)}
                  className={inputClass}
                />
              </div>
            </Section>
          </Panel>

          <Panel title="Ingrediënten en herkomst">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Ingrediënten" htmlFor="f-ingredients">
                {txt("ingredients", { rows: 3 })}
              </Field>
              <Field label="Allergenen" htmlFor="f-allergens">
                {txt("allergens", { rows: 3 })}
              </Field>
              <Field label="Herkomst" htmlFor="f-origin">
                {txt("origin", { rows: 2 })}
              </Field>
              <Field label="Bewaren" htmlFor="f-storage">
                {txt("storage", { rows: 2 })}
              </Field>
              <Field
                label="Verpakking"
                htmlFor="f-packaging"
                hint="Bijv. papieren zakje of glazen potje."
              >
                {txt("packaging")}
              </Field>
            </div>
          </Panel>

          <Panel title="Zo gebruik je het">
            <ListEditor
              value={form.usage}
              onChange={(v) => set("usage", v)}
              columns={[
                { key: "title", label: "Titel", placeholder: "In de saus" },
                { key: "body", label: "Uitleg", multiline: true },
              ]}
              empty={{ title: "", body: "" }}
              addLabel="Gebruikstip toevoegen"
            />
            <Section title="Tip (zwart blok)">{txt("tip", { rows: 2 })}</Section>
          </Panel>

          <Panel title="Veelgestelde vragen">
            <ListEditor
              value={form.faq}
              onChange={(v) => set("faq", v)}
              columns={[
                { key: "q", label: "Vraag" },
                { key: "a", label: "Antwoord", multiline: true },
              ]}
              empty={{ q: "", a: "" }}
              addLabel="Vraag toevoegen"
            />
          </Panel>

          <Panel title="Intern en zoekmachines" description="Niet zichtbaar op de pagina zelf.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Verzendgewicht (gram)"
                htmlFor="f-weight_grams"
                error={errors.weight_grams}
                hint="Inclusief verpakking; handig voor de verzendkosten."
              >
                {txt("weight_grams", { type: "number", inputMode: "numeric" })}
              </Field>
              <Field
                label="Titel in Google"
                htmlFor="f-seo_title"
                hint={`Leeg = “${form.name || "Naam"} | ANET”`}
              >
                {txt("seo_title")}
              </Field>
              <Field
                label="Omschrijving in Google"
                htmlFor="f-seo_description"
                hint="Leeg = de beschrijving."
                className="sm:col-span-2"
              >
                {txt("seo_description", { rows: 2 })}
              </Field>
            </div>
          </Panel>

          {product && (
            <Panel
              title="Product verwijderen"
              description="Liever tijdelijk weg? Zet het product dan op verborgen. Oude bestellingen blijven bewaard."
            >
              <button
                type="button"
                className={adminBtn.danger}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="size-4" /> Verwijderen
              </button>
            </Panel>
          )}
        </div>
      </AdminPage>

      <div className="sticky bottom-0 z-20 border-t border-border bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3 sm:px-6">
          {dirty && (
            <span className="mr-auto text-sm text-muted-foreground">
              Niet-opgeslagen wijzigingen
            </span>
          )}
          <Link to="/beheer/producten" className={adminBtn.secondary}>
            Annuleren
          </Link>
          <button type="submit" className={adminBtn.primary} disabled={save.isPending}>
            {save.isPending ? "Opslaan…" : product ? "Opslaan" : "Product toevoegen"}
          </button>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogTitle>{product?.name} verwijderen?</AlertDialogTitle>
          <AlertDialogDescription>
            Het product verdwijnt van de website en uit het beheer. Dit kan niet ongedaan worden
            gemaakt.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Terug</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-destructive hover:bg-destructive/90"
              onClick={() => remove.mutate()}
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mt-6 border-t border-border pt-5">
      <p className="text-sm font-semibold">{title}</p>
      {hint && <p className="mb-3 text-xs text-muted-foreground">{hint}</p>}
      <div className={hint ? "" : "mt-3"}>{children}</div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 border border-border p-4">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
