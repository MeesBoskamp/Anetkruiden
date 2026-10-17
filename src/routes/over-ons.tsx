import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/site/PageShell";
import { useTr } from "@/lib/i18n";

export const Route = createFileRoute("/over-ons")({
  head: () => ({
    meta: [
      { title: "Over ons | Anetkruiden" },
      { name: "description", content: "Het verhaal achter Anetkruiden: waarom we zijn begonnen." },
    ],
  }),
  component: About,
});

function About() {
  const tr = useTr();
  return (
    <PageShell
      title={tr({ nl: "Over ons", en: "About us" })}
      intro={tr({
        nl: "Voorbeeldtekst: één of twee zinnen die samenvatten waar Anetkruiden voor staat.",
        en: "Example text: one or two sentences summarising what Anetkruiden stands for.",
      })}
      draft
    >
      <div className="grid gap-10 md:grid-cols-2">
        <div className="flex aspect-[4/5] items-center justify-center bg-stone p-6 text-center text-muted-foreground">
          [Foto van de oprichter(s) of van de plek waar het begon]
        </div>
        <div className="space-y-6">
          <h2 className="!mt-0">Waarom we zijn begonnen</h2>
          <p>
            [Hier komt het verhaal. Wat was het moment waarop het idee ontstond? Wat missen jullie
            bij andere kruidenwinkels? Schrijf het zoals je het aan een vriend zou vertellen.]
          </p>
          <p>
            [Tweede alinea: wat maakt jullie aanpak anders, en wat mogen klanten van jullie
            verwachten?]
          </p>
        </div>
      </div>

      <h2>Waar we voor staan</h2>
      <ul>
        <li>[Waarde 1, bijvoorbeeld: eerlijke informatie over ingrediënten]</li>
        <li>[Waarde 2]</li>
        <li>[Waarde 3]</li>
      </ul>
    </PageShell>
  );
}
