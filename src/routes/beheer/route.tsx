import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ExternalLink, LogOut } from "lucide-react";

import { LoginForm } from "@/components/admin/LoginForm";
import { adminBtn, Loading } from "@/components/admin/ui";
import { Toaster } from "@/components/ui/sonner";
import { useAdmin } from "@/lib/admin/auth";

export const Route = createFileRoute("/beheer")({
  // Het beheer draait alleen in de browser: de inlogsessie staat daar.
  ssr: false,
  head: () => ({
    meta: [{ title: "Beheer | ANET" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: BeheerLayout,
});

const nav = [
  { to: "/beheer", label: "Overzicht", exact: true },
  { to: "/beheer/bestellingen", label: "Bestellingen", exact: false },
  { to: "/beheer/voorraad", label: "Voorraad", exact: false },
  { to: "/beheer/producten", label: "Producten", exact: false },
] as const;

function BeheerLayout() {
  const { state, signOut } = useAdmin();

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-6">
        <Loading />
      </div>
    );
  }

  if (state.status === "unavailable") {
    return (
      <Centered title="Beheer nog niet beschikbaar">
        De database is nog niet gekoppeld. Neem contact op met de beheerder van de website.
      </Centered>
    );
  }

  if (state.status === "signed-out") return <LoginForm />;

  if (state.status === "not-admin") {
    return (
      <Centered title="Geen toegang">
        Je bent ingelogd als <strong>{state.email}</strong>, maar dit account is geen beheerder.
        <div className="mt-6">
          <button type="button" onClick={signOut} className={adminBtn.secondary}>
            Uitloggen
          </button>
        </div>
      </Centered>
    );
  }

  return (
    <div className="min-h-screen bg-cream/40">
      <header className="sticky top-0 z-30 border-b border-border bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link to="/beheer" className="flex items-baseline gap-2">
            <span className="font-display text-2xl italic">ANET</span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Beheer
            </span>
          </Link>
          <nav
            aria-label="Beheer"
            className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto"
          >
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="whitespace-nowrap px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-ink"
                activeProps={{ className: "bg-ink !text-white" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <a href="/" target="_blank" rel="noreferrer" className={adminBtn.ghost}>
              <ExternalLink className="size-4" />
              <span className="hidden md:inline">Website</span>
            </a>
            <button type="button" onClick={signOut} className={adminBtn.ghost} title={state.email}>
              <LogOut className="size-4" />
              <span className="hidden md:inline">Uitloggen</span>
            </button>
          </div>
        </div>
      </header>
      <Outlet />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

function Centered({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-4xl">{title}</h1>
        <div className="mt-4 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
