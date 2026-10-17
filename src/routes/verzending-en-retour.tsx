import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/site/PageShell";
import { useTr } from "@/lib/i18n";

export const Route = createFileRoute("/verzending-en-retour")({
  head: () => ({
    meta: [
      { title: "Verzending en retour | Anetkruiden" },
      { name: "description", content: "Informatie over verzending, levertijd en retourneren." },
    ],
  }),
  component: Shipping,
});

function Shipping() {
  const tr = useTr();
  return (
    <PageShell
      title={tr({ nl: "Verzending en retour", en: "Shipping and returns" })}
      intro={tr({
        nl: "Wat je mag verwachten na je bestelling.",
        en: "What to expect after you order.",
      })}
      draft
    >
      <h2>Verzending</h2>
      <ul>
        <li>We verzenden voorlopig alleen binnen Nederland.</li>
        <li>Bestellingen worden handmatig verzonden. [Verzendtijd en vervoerder invullen.]</li>
        <li>Verzendkosten: [bedrag invullen]. Gratis verzending vanaf [bedrag invullen].</li>
      </ul>

      <h2>Retourneren</h2>
      <p>
        Bij een bestelling op afstand heb je in principe 14 dagen bedenktijd. [Laten controleren
        welke uitzonderingen voor voedingsproducten gelden en hoe retourneren precies werkt.]
      </p>
      <ul>
        <li>Meld je retour eerst via de contactpagina.</li>
        <li>[Wie betaalt de retourkosten? Invullen.]</li>
        <li>[Binnen hoeveel dagen volgt de terugbetaling? Invullen.]</li>
      </ul>

      <h2>Beschadigd of verkeerd ontvangen?</h2>
      <p>Neem contact met ons op met een foto, dan lossen we het samen op.</p>
    </PageShell>
  );
}
