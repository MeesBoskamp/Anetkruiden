import type { Text } from "@/lib/i18n";

/**
 * Centrale plek voor bedrijfsgegevens en vaste teksten.
 * Waarden tussen [haken] zijn nog in te vullen door de ondernemer.
 */
export const site = {
  name: "ANET",
  domain: "anetkruiden.nl",
  email: "[e-mailadres]",
  phone: "[telefoonnummer]",
  address: "[adres]",
  kvk: "[KvK-nummer]",
  vat: "[btw-nummer]",
  freeShippingFromCents: 5900, // voorbeeldwaarde, nog bevestigen
};

/** Berichten in de aankondigingsbalk. */
export const announcements: Text[] = [
  {
    nl: "Kruiden uit eigen tuin in het Naardermeer",
    en: "Herbs from my own garden in the Naardermeer",
  },
  {
    nl: `Gratis verzending vanaf €${site.freeShippingFromCents / 100} (voorbeeld)`,
    en: `Free shipping from €${site.freeShippingFromCents / 100} (example)`,
  },
  { nl: "Ik verzend binnen Nederland", en: "I ship within the Netherlands" },
];
