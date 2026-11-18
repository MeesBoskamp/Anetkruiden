import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AnnouncementBar } from "./AnnouncementBar";
import { CartDrawer } from "./CartDrawer";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Het beheerportaal heeft een eigen kop en geen winkelonderdelen.
  if (pathname === "/beheer" || pathname.startsWith("/beheer/")) {
    return <main id="inhoud">{children}</main>;
  }

  return (
    <>
      <a
        href="#inhoud"
        className="sr-only z-50 bg-white px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Naar de inhoud / Skip to content
      </a>
      <AnnouncementBar />
      <Header />
      <main id="inhoud">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
