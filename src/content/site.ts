import type { Text } from "@/lib/i18n";

/**
 * Centrale plek voor bedrijfsgegevens en vaste teksten.
 * Waarden tussen [haken] zijn nog in te vullen door de ondernemer.
 */
export const site = {
  name: "Anetkruiden",
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
  { nl: "Welkom bij Anetkruiden", en: "Welcome to Anetkruiden" },
  {
    nl: `Gratis verzending vanaf €${site.freeShippingFromCents / 100} (voorbeeld)`,
    en: `Free shipping from €${site.freeShippingFromCents / 100} (example)`,
  },
  { nl: "Wij verzenden binnen Nederland", en: "We ship within the Netherlands" },
];
