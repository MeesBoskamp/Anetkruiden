import type { ReactNode } from "react";

import { AnnouncementBar } from "./AnnouncementBar";
import { CartDrawer } from "./CartDrawer";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function SiteLayout({ children }: { children: ReactNode }) {
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
