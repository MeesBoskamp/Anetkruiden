import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { useTr } from "@/lib/i18n";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

export function Header() {
  const tr = useTr();
  const { count, setOpen } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/";
  const overHero = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/shop", label: tr({ nl: "Shop", en: "Shop" }) },
    { to: "/over-ons", label: tr({ nl: "Over ons", en: "About us" }) },
    { to: "/faq", label: tr({ nl: "Veelgestelde vragen", en: "FAQ" }) },
    { to: "/contact", label: tr({ nl: "Contact", en: "Contact" }) },
  ] as const;

  return (
    <header
      className={[
        "sticky top-0 z-40 h-[72px] transition-colors duration-200",
        isHome ? "-mb-[72px]" : "",
        overHero
          ? "bg-transparent text-white"
          : "border-b border-border bg-paper/95 text-ink backdrop-blur",
      ].join(" ")}
    >
      <div className="mx-auto grid h-full max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
        <nav aria-label={tr({ nl: "Hoofdmenu", en: "Main menu" })} className="flex items-center">
          <button
            type="button"
            className="-ml-2 p-2 md:hidden"
            aria-label={tr({ nl: "Menu openen", en: "Open menu" })}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-6" />
          </button>
          <ul className="hidden items-center gap-7 text-[15px] md:flex">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="opacity-90 hover:opacity-100"
                  activeProps={{ className: "underline underline-offset-[10px] decoration-2" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Logo />

        <div className="flex items-center justify-end gap-5">
          <LanguageSwitcher className="hidden sm:flex" />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="-mr-2 flex items-center gap-2 p-2 text-[15px]"
            aria-label={tr({
              nl: `Winkelmand openen, ${count} artikelen`,
              en: `Open cart, ${count} items`,
            })}
          >
            <ShoppingBag className="size-5" />
            <span aria-hidden="true">({count})</span>
          </button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-sm bg-paper">
          <SheetTitle className="sr-only">{tr({ nl: "Menu", en: "Menu" })}</SheetTitle>
          <nav className="mt-10 flex flex-col gap-1">
            {links.map((l) => (
              <SheetClose asChild key={l.to}>
                <Link to={l.to} className="display border-b border-border py-4 text-3xl">
                  {l.label}
                </Link>
              </SheetClose>
            ))}
          </nav>
          <LanguageSwitcher className="mt-8" />
        </SheetContent>
      </Sheet>
    </header>
  );
}
