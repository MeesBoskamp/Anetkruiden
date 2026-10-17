import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/site/PageShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTr, type Text } from "@/lib/i18n";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Veelgestelde vragen | Anetkruiden" },
      {
        name: "description",
        content: "Antwoorden op veelgestelde vragen over bestellen, verzenden en bewaren.",
      },
    ],
  }),
  component: Faq,
});

const items: { q: Text; a: Text }[] = [
  {
    q: { nl: "Hoe bestel ik?", en: "How do I order?" },
    a: {
      nl: "Kies je producten, doe ze in de winkelmand en reken af. [Betaalmethoden invullen zodra de koppeling live is.]",
    },
  },
  {
    q: { nl: "Waar verzenden jullie naartoe?", en: "Where do you ship?" },
    a: { nl: "Voorlopig alleen binnen Nederland.", en: "For now only within the Netherlands." },
  },
  {
    q: { nl: "Hoe snel wordt mijn bestelling verzonden?", en: "How quickly is my order shipped?" },
    a: { nl: "[Verzendtijd invullen.] Bestellingen worden handmatig verzonden." },
  },
  {
    q: { nl: "Hoe bewaar ik de producten?", en: "How should I store the products?" },
    a: { nl: "Bewaarinformatie staat op elke productpagina en op de verpakking." },
  },
  {
    q: { nl: "Kan ik mijn bestelling retourneren?", en: "Can I return my order?" },
    a: { nl: "Zie de pagina Verzending en retour voor alle informatie." },
  },
  {
    q: { nl: "Ik heb een andere vraag.", en: "I have another question." },
    a: { nl: "Neem contact met ons op via de contactpagina." },
  },
];

function Faq() {
  const tr = useTr();
  return (
    <PageShell
      title={tr({ nl: "Veelgestelde vragen", en: "FAQ" })}
      intro={tr({
        nl: "Antwoorden op de meest gestelde vragen.",
        en: "Answers to the most common questions.",
      })}
      draft
    >
      <Accordion type="single" collapsible>
        {items.map((item, i) => (
          <AccordionItem key={i} value={`q-${i}`}>
            <AccordionTrigger className="text-left text-lg">{tr(item.q)}</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground">
              {tr(item.a)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </PageShell>
  );
}
