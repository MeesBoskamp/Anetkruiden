import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/site/PageShell";
import { site } from "@/content/site";
import { useTr } from "@/lib/i18n";

export const Route = createFileRoute("/algemene-voorwaarden")({
  head: () => ({ meta: [{ title: "Algemene voorwaarden | Anetkruiden" }] }),
  component: Terms,
});

function Terms() {
  const tr = useTr();
  return (
    <PageShell title={tr({ nl: "Algemene voorwaarden", en: "Terms and conditions" })} draft>
      <p>
        Deze voorwaarden zijn van toepassing op alle aanbiedingen en bestellingen van {site.name},
        KvK {site.kvk}, gevestigd te {site.address}.
      </p>
      <h2>1. Aanbod en prijzen</h2>
      <p>
        Alle prijzen zijn in euro&apos;s en inclusief btw, tenzij anders vermeld. [Controleren.]
      </p>
      <h2>2. Bestelling en betaling</h2>
      <p>[Betaalmethoden en het moment van betaling invullen.]</p>
      <h2>3. Levering</h2>
      <p>[Levertijd en leveringsgebied invullen. Zie ook de pagina Verzending en retour.]</p>
      <h2>4. Herroepingsrecht</h2>
      <p>[Tekst over de bedenktijd en het modelformulier laten opstellen of controleren.]</p>
      <h2>5. Klachten</h2>
      <p>[Klachtenprocedure invullen.]</p>
      <h2>6. Toepasselijk recht</h2>
      <p>Op alle overeenkomsten is Nederlands recht van toepassing. [Controleren.]</p>
    </PageShell>
  );
}
