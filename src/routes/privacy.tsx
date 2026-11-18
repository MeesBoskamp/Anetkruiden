import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/site/PageShell";
import { site } from "@/content/site";
import { useTr } from "@/lib/i18n";
import { Brand } from "@/components/site/Brand";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacyverklaring | ANET" }] }),
  component: Privacy,
});

function Privacy() {
  const tr = useTr();
  return (
    <PageShell title={tr({ nl: "Privacyverklaring", en: "Privacy policy" })} draft>
      <p>
        <Brand /> (KvK {site.kvk}) is verantwoordelijk voor de verwerking van persoonsgegevens zoals
        beschreven in deze verklaring. Contact: {site.email}.
      </p>
      <h2>Welke gegevens ik verwerk</h2>
      <ul>
        <li>Gegevens die je invult bij een bestelling: naam, adres, e-mailadres. [Aanvullen.]</li>
        <li>Gegevens voor betaling via mijn betaalprovider. [Naam provider invullen.]</li>
        <li>Je taalvoorkeur en winkelmand, bewaard in je eigen browser.</li>
      </ul>
      <h2>Waarvoor ik ze gebruik</h2>
      <p>Om je bestelling uit te voeren, te verzenden en voor mijn administratie. [Controleren.]</p>
      <h2>Met wie ik gegevens deel</h2>
      <p>[Verwerkers invullen, bijvoorbeeld betaalprovider, hosting, e-mail en vervoerder.]</p>
      <h2>Bewaartermijn</h2>
      <p>[Bewaartermijnen invullen, rekening houdend met de fiscale bewaarplicht.]</p>
      <h2>Je rechten</h2>
      <p>
        Je kunt je gegevens inzien, laten corrigeren of laten verwijderen. Stuur daarvoor een
        bericht naar het contactadres hierboven. Je kunt ook een klacht indienen bij de Autoriteit
        Persoonsgegevens.
      </p>
    </PageShell>
  );
}
