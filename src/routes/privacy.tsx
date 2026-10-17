import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/site/PageShell";
import { site } from "@/content/site";
import { useTr } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacyverklaring | Anetkruiden" }] }),
  component: Privacy,
});

function Privacy() {
  const tr = useTr();
  return (
    <PageShell title={tr({ nl: "Privacyverklaring", en: "Privacy policy" })} draft>
      <p>
        {site.name} (KvK {site.kvk}) is verantwoordelijk voor de verwerking van persoonsgegevens
        zoals beschreven in deze verklaring. Contact: {site.email}.
      </p>
      <h2>Welke gegevens we verwerken</h2>
      <ul>
        <li>Gegevens die je invult bij een bestelling: naam, adres, e-mailadres. [Aanvullen.]</li>
        <li>Gegevens voor betaling via onze betaalprovider. [Naam provider invullen.]</li>
        <li>Je taalvoorkeur en winkelmand, bewaard in je eigen browser.</li>
      </ul>
      <h2>Waarvoor we ze gebruiken</h2>
      <p>Om je bestelling uit te voeren, te verzenden en voor onze administratie. [Controleren.]</p>
      <h2>Met wie we gegevens delen</h2>
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
