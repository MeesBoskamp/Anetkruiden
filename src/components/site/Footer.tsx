import { Link } from "@tanstack/react-router";

import { products } from "@/content/products";
import { site } from "@/content/site";
import { useTr } from "@/lib/i18n";

import { Logo } from "./Logo";

export function Footer() {
  const tr = useTr();
  const year = new Date().getFullYear();

  const info = [
    { to: "/over-ons", label: tr({ nl: "Over ons", en: "About us" }) },
    { to: "/faq", label: tr({ nl: "Veelgestelde vragen", en: "FAQ" }) },
    {
      to: "/verzending-en-retour",
      label: tr({ nl: "Verzending en retour", en: "Shipping and returns" }),
    },
    { to: "/contact", label: tr({ nl: "Contact", en: "Contact" }) },
  ] as const;

  const legal = [
    {
      to: "/algemene-voorwaarden",
      label: tr({ nl: "Algemene voorwaarden", en: "Terms and conditions" }),
    },
    { to: "/privacy", label: tr({ nl: "Privacyverklaring", en: "Privacy policy" }) },
  ] as const;

  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo className="text-3xl" />
          <p className="mt-4 max-w-xs text-sm text-white/70">
            {tr({
              nl: "Kruiden uit de natuur, zonder onnodige poespas.",
              en: "Herbs from nature, without unnecessary fuss.",
            })}
          </p>
        </div>

        <nav aria-label="Shop">
          <h2 className="display text-xl text-calendula">Shop</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {products.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/producten/$slug"
                  params={{ slug: p.slug }}
                  className="text-white/80 hover:text-white"
                >
                  {tr(p.name)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Info">
          <h2 className="display text-xl text-calendula">Info</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {info.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-white/80 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={tr({ nl: "Juridisch", en: "Legal" })}>
          <h2 className="display text-xl text-calendula">{tr({ nl: "Juridisch", en: "Legal" })}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {legal.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-white/80 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-white/50">
            KvK {site.kvk} · {tr({ nl: "btw", en: "VAT" })} {site.vat}
          </p>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1600px] px-4 py-5 text-xs text-white/50 sm:px-6">
          © {year} {site.name}
        </p>
      </div>
    </footer>
  );
}
