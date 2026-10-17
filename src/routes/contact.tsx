import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/site/PageShell";
import { site } from "@/content/site";
import { useTr } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Anetkruiden" },
      { name: "description", content: "Neem contact op met Anetkruiden." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const tr = useTr();
  const emailIsReal = !site.email.startsWith("[");
  return (
    <PageShell
      title="Contact"
      intro={tr({
        nl: "Een vraag over een product of je bestelling? Stuur ons een bericht.",
        en: "A question about a product or your order? Send us a message.",
      })}
    >
      <dl className="grid gap-8 sm:grid-cols-2">
        <div>
          <dt className="square-mark text-sm font-medium">E-mail</dt>
          <dd className="mt-2">
            {emailIsReal ? <a href={`mailto:${site.email}`}>{site.email}</a> : site.email}
          </dd>
        </div>
        <div>
          <dt className="square-mark text-sm font-medium">{tr({ nl: "Telefoon", en: "Phone" })}</dt>
          <dd className="mt-2">{site.phone}</dd>
        </div>
        <div>
          <dt className="square-mark text-sm font-medium">{tr({ nl: "Adres", en: "Address" })}</dt>
          <dd className="mt-2">{site.address}</dd>
        </div>
        <div>
          <dt className="square-mark text-sm font-medium">KvK</dt>
          <dd className="mt-2">{site.kvk}</dd>
        </div>
      </dl>
      <p className="text-muted-foreground">
        {tr({
          nl: "Een contactformulier volgt zodra de koppeling met e-mail klaar is.",
          en: "A contact form will follow once the email connection is ready.",
        })}
      </p>
    </PageShell>
  );
}
