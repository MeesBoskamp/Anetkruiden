# PLAN.md: Webshop Anetkruiden (anetkruiden.nl)

> Levend document. Na elke fase: vink af, noteer beslissingen en voeg een regel toe aan het logboek onderaan.
> Werkwijze: Claude schrijft alle code direct in de GitHub-repo (MeesBoskamp/Anetkruiden) en pusht naar `main`. Lovable is gekoppeld aan die repo en toont/previewt wat er gepusht wordt, zonder dat we de Lovable-chat (en dus credits) gebruiken.

## 0. Status

| Fase | Onderwerp | Status |
|---|---|---|
| 0 | Voorbereiding en beslissingen | 🟡 (logo/foto's en Cloudflare-nameservers open) |
| 1 | Fundament: design, layout, GitHub | ✅ |
| 2 | Content-pagina's (Home, Over ons, Contact) | 🟡 (pagina's staan; contactformulier en nieuwsbrief wachten op backend) |
| 3 | Producten en productpagina's | 🟡 (pagina's staan met voorbeelddata; database volgt) |
| 4 | Winkelmand en betaling | ⬜ |
| 5 | Admin-login, orderbeheer en blogbeheer | ⬜ |
| 6 | Juridisch, SEO, performance | ⬜ |
| 7 | Hosting en livegang | ⬜ |
| 8 | Marketing en groei | ⬜ |

## 1. Aannames en open vragen (invullen)

- Aanname: we verkopen (brandnetel)kruiden, thee, poeders of vergelijkbare producten, goedkoop (richtprijs: €__ tot €__).
- [x] Verkoop: alleen NL bij de start (BE/DE/EU later; checkout en btw dus voorlopig alleen NL)
- [x] Verzending: handmatig, geen vervoerder-koppeling nu (Sendcloud/PostNL-integratie later eventueel)
- [x] Taal: NL + EN (taalschakelaar op de site)
- [x] Bedrijfsvorm, KvK-nummer en btw-nummer: geregeld
- [x] Aantal producten bij launch: 5
- [x] Varianten: 1 per product (geen gewichtskeuze bij launch)
- [x] Bedrijfsnaam en domeinnaam: **Anetkruiden**, domein **anetkruiden.nl** is gekocht
- [x] Blogposts en productteksten: alleen Nederlands voor de MVP (vertalen naar EN later)
- [ ] Logo, huisstijl en foto's: komen nog, worden geüpload (zie sectie 9)

## 2. Pagina's

**Publiek**
1. **Home**: hero, korte uitleg, uitgelichte producten, USP's (vers, lokaal, duurzaam), reviews, nieuwsbriefaanmelding
2. **Shop / alle producten**: grid, filter op categorie, sortering
3. **Productpagina** (per product): foto's, beschrijving, ingrediënten, herkomst, gebruiksadvies, gewicht, allergenen, prijs, varianten, "in winkelmand", gerelateerde producten
4. **Over ons**: waarom we zijn begonnen, het verhaal, waarden, foto's van de oprichter(s)
5. **Winkelmand**
6. **Checkout** (adres, verzending, betaling)
7. **Orderbevestiging** (bedankpagina)
8. **Contact**

**Aanvullende pagina's (voorgesteld door Claude, akkoord op 2026-10-17)**
9. **FAQ**: verzending, bewaren, gebruik, retour
10. **Verzending en retour**
11. **Juridisch**: algemene voorwaarden, privacyverklaring, cookiebeleid, herroepingsrecht (verplicht in NL/EU)
12. **Blog of Kennis**: recepten, gebruik van kruiden (goed voor SEO en marketing)
13. **Reviews/testimonials** (sectie op Home en op productpagina's)
14. **404-pagina**
15. **Mijn bestelling volgen** (optioneel, fase 2 van het project)

**Admin (afgeschermd)**
16. **Login**
17. **Orderoverzicht** (nieuw, betaald, verzonden; zoeken en filteren)
    - Standaardfilter **"Te verzenden"**: alle betaalde orders die nog niet verstuurd zijn, bovenaan
18. **Orderdetail** (klant, producten, adres, status wijzigen, track-and-trace)
19. **Productbeheer** (aanmaken, prijzen, voorraad, foto's) (sterk aanbevolen, anders moet elke wijziging via code)
20. **Blogbeheer**: blogposts aanmaken, bewerken, concept opslaan, publiceren en verwijderen vanuit dezelfde admin-login (editor met koppen, afbeeldingen, links; titel, slug, samenvatting, omslagfoto, SEO-velden)

## 3. Techstack (voorstel)

- **Frontend**: TanStack Start (React) + Tailwind + shadcn/ui (huidige Lovable-standaardtemplate; was eerder als React + Vite in dit plan gezet). Let op: build-instellingen voor Cloudflare in fase 7 kijken we na op basis van deze template.
- **Backend/database/auth**: Supabase (Lovable Cloud of eigen Supabase-project): tabellen, Row Level Security, edge functions voor betaalwebhooks
- **Betaling**: zie sectie 4
- **E-mail** (orderbevestiging): Resend of vergelijkbaar, getriggerd vanuit een edge function
- **Code**: GitHub-repo gekoppeld aan Lovable; Claude Code werkt via branches en PR's

### Datamodel (eerste opzet)
- Tweetaligheid: de vaste interface-teksten zijn NL + EN. Productteksten en blog zijn bij de MVP alleen Nederlands, maar we slaan ze toch per taal op (bijvoorbeeld `naam_nl`, met `naam_en` leeg of nullable, of een aparte vertalingentabel), zodat Engelse teksten later zonder ombouw kunnen. Ontbreekt een Engelse tekst, dan toont de EN-site de Nederlandse.
- Bij launch 1 variant per product; de `product_variants`-tabel houden we toch, zodat gewichtsvarianten later zonder ombouw kunnen
- `products` (id, slug, naam, beschrijving, ingrediënten, herkomst, allergenen, actief)
- `product_variants` (product_id, label, gewicht, prijs, voorraad, sku)
- `product_images` (product_id, url, volgorde)
- `orders` (id, status, totaal, verzendkosten, btw, klantgegevens, betaal-id, tracking)
- `order_items` (order_id, variant_id, aantal, prijs op moment van aankoop)
- `blog_posts` (id, slug, titel, samenvatting, inhoud, omslagfoto, status concept/gepubliceerd, gepubliceerd_op, seo_titel, seo_beschrijving, auteur)
- `user_roles` (user_id, role) → **admin-rol in aparte tabel**, nooit op het profiel zelf (voorkomt privilege escalation)
- RLS-regel: bezoekers mogen alleen **gepubliceerde** blogposts lezen; aanmaken, wijzigen en verwijderen alleen met admin-rol

## 4. Betaling: Mollie vs Stripe

| Criterium | Mollie | Stripe |
|---|---|---|
| iDEAL, Bancontact, creditcard, Apple Pay | Ja, NL-focus, uitstekende iDEAL-ervaring | Ja, ook iDEAL |
| Kosten | Vaste fee per transactie, geen maandkosten (actuele tarieven controleren) | Percentage + vast bedrag (actuele tarieven controleren) |
| Lovable-integratie | Geen kant-en-klare koppeling: via edge function + webhook (meer werk, goed te doen met Claude Code) | Ingebouwde Stripe-integratie in Lovable (sneller) |
| Dashboard en support | Nederlands, lokaal | Engels, uitgebreid, veel documentatie |
| Internationaal | Goed in Europa | Sterkste wereldwijd |
| Voor goedkope producten | Vaste fee per transactie kan bij kleine bedragen relatief hoog zijn, vergelijk dit! | Zelfde probleem: reken het door |

**Aanbeveling (voorlopig):**
- Verkoop vooral in NL/BE en klanten verwachten iDEAL → **Mollie**, mits we de extra bouwtijd accepteren.
- Snel live willen met minimale bouwtijd → **Stripe** (ondersteunt ook iDEAL).
- Besluit meenemen: **gemiddelde bestelwaarde** × transactiekosten. Bij lage prijzen helpt een **gratis-verzending-drempel** en **bundels** om de kosten per order te drukken.

Beslissing: [x] Mollie [ ] Stripe, reden: iDEAL-focus voor de NL-markt (verkoop start alleen in NL); koppeling via een Supabase edge function + webhook

## 5. Hosting

| Optie | Voordelen | Nadelen |
|---|---|---|
| **Lovable-hosting (Pro)** | Alles in één, publiceren met één klik, eigen domein koppelbaar | Minder controle, afhankelijk van het platform |
| **Cloudflare Pages** (via GitHub) | Snel (CDN), gratis tier ruim, volledige controle, automatische deploys vanuit GitHub, Cloudflare DNS en bescherming | Iets meer setup |

**Aanbeveling:** start met Lovable-hosting om snel te valideren; als de shop groeit of we meer controle willen, verhuizen naar Cloudflare Pages (de code staat toch al in GitHub). Backend (Supabase) blijft los van de frontendhosting.

Beslissing: [ ] Lovable [x] Cloudflare, reden: volledige controle en snelle CDN; de code staat toch al in GitHub

## 6. Fasering en instructies

### Fase 0: Voorbereiding
- [ ] Open vragen uit sectie 1 beantwoorden
- [ ] Logo, huisstijl, foto's uploaden
- [ ] Betaalprovider en hosting kiezen (sectie 4 en 5)
- [x] GitHub-repo `MeesBoskamp/Anetkruiden`, gekoppeld aan het Lovable-project (repo is publiek: nooit geheimen in de code zetten)
- [x] Domeinnaam **anetkruiden.nl** gekocht

### Fase 1: Fundament
- [x] Lovable-project aangemaakt (Anetkruiden) en gekoppeld met GitHub
- [x] Kleurpalet, typografie, componenten vastgelegd (sectie 8 en DESIGN.md; palet voorlopig, lettertypes lokaal gehost)
- [x] Meertaligheid (NL + EN) vanaf het begin opgezet: taalschakelaar in de header, vertaalbestanden voor alle vaste teksten (achteraf toevoegen is veel werk)
- [x] Layout: header (logo, menu, taalschakelaar, winkelmand-icoon), footer (links, juridisch, contact)
- [ ] Responsive visueel checken in de Lovable-preview (gebouwd mobiel eerst, nog niet met eigen ogen bekeken)
- [x] `PLAN.md` en `DESIGN.md` in de repo gezet
**Klaar als:** lege pagina's met navigatie en huisstijl staan op een previewlink, en de repo is in sync.

### Fase 2: Content-pagina's
- [x] Home, Over ons (verhaal van waarom we begonnen), Contact, FAQ, Verzending en retour, Algemene voorwaarden, Privacy (alle met voorbeeld- of concepttekst die nog vervangen/gecontroleerd moet worden)
- [ ] Contactformulier (met spambescherming) → e-mail naar ondernemer: uitgesteld tot de backend (Supabase edge function + e-mailprovider) er is; tot dan staan contactgegevens op de pagina
- [ ] Nieuwsbriefaanmelding: idem, uitgesteld
**Input nodig:** tekst en foto's voor Over ons.

### Fase 3: Producten
- [ ] Supabase-tabellen aanmaken (sectie 3) met RLS: nog te doen; vereist een eigen Supabase-project (let op mogelijke kosten)
- [x] Shop-overzicht + uitgebreide productpagina's (nu nog op basis van `src/content/products.ts`, later database)
- [ ] Echte producten, teksten en foto's: voorbeeldproducten staan er, echte gegevens volgen van de ondernemer
- [x] SEO per product (titel, meta, structured data `Product`); site staat bewust op `noindex` tot livegang
**Klaar als:** alle producten zijn uit de database zichtbaar met varianten en prijzen.

### Fase 4: Winkelmand en betaling
- [ ] Winkelmand (lokaal opgeslagen, aanpasbaar)
- [ ] Checkout: adres, verzendmethode en -kosten, btw correct
- [ ] Betaalintegratie (Mollie of Stripe) via edge function; webhook zet order op "betaald"
- [ ] Orderbevestigingsmail naar klant en melding naar ondernemer
- [ ] Testmodus doorlopen: gelukte betaling, mislukte betaling, geannuleerde betaling
**Belangrijk:** prijzen altijd server-side herberekenen; nooit het bedrag uit de browser vertrouwen.

### Fase 5: Admin
- [ ] Inloggen (Supabase Auth) met admin-rol (aparte `user_roles`-tabel)
- [ ] Orderlijst en detail, statuswijziging (betaald → verzonden), track-and-trace in verzendmail
- [ ] Productbeheer (CRUD, foto-upload, voorraad)
- [ ] Weergave "Te verzenden" als standaardoverzicht voor de dagelijkse verzendroutine
- [ ] **Blog**: publieke blogoverzichtspagina en blogpost-pagina (op basis van `blog_posts`), plus admin-editor om posts te schrijven en te publiceren (concept → gepubliceerd), afbeeldingen uploaden naar storage
- [ ] Blogposts krijgen SEO-metadata en komen automatisch in de sitemap
- [ ] Optioneel: CSV-export van orders voor administratie/boekhouding
**Klaar als:** een testbestelling verschijnt automatisch in het adminpaneel zonder handwerk, en de ondernemer kan zelf in dezelfde admin een blogpost schrijven en publiceren die direct op de site staat.

### Fase 6: Juridisch, SEO en kwaliteit
- [ ] Algemene voorwaarden, privacy, cookies, herroepingsrecht, verzending en retour
- [ ] Cookiebanner (alleen toestemming vragen voor niet-noodzakelijke cookies)
- [ ] **Voedsel/kruiden**: productinformatie volgens wet (ingrediënten, allergenen, houdbaarheid, netto-inhoud, herkomst). **Geen gezondheidsclaims** ("geneest...", "goed tegen...") zonder dat die zijn toegestaan; check de regels van de NVWA
- [ ] Sitemap, robots.txt, Open Graph-afbeeldingen, Lighthouse-score controleren
- [ ] Toegankelijkheid (contrast, alt-teksten, toetsenbord)

### Fase 7: Hosting en livegang
- [ ] Domein koppelen, SSL
- [ ] Betaalprovider van test naar live
- [ ] Echte testbestelling met echt geld (en terugbetalen)
- [ ] Back-up en monitoring (uptime-check, foutmeldingen)

### Fase 8: Marketing
Zie sectie 7.

## 7. Marketingstrategie (eerste gedachten)

Omdat producten goedkoop zijn, draait het om **volume, herhaalaankopen en lage acquisitiekosten**.
- **Organisch/SEO**: blog met recepten en gebruiksartikelen, goede productpagina's; dit kost tijd, maar niets per klik
- **Social (Instagram/TikTok/Pinterest)**: korte video's over oogsten, verwerken, recepten; foto's van het verhaal achter het merk
- **E-mail**: nieuwsbrief-aanmelding vanaf dag 1 met een eerste-bestelling-kortingscode; later herhaalbestelmails
- **Gemiddelde orderwaarde verhogen**: bundels, gratis verzending vanaf €__, "proefpakket"
- **Lokaal en partners**: markten, lokale winkels, samenwerking met kookbloggers/influencers (kleine, betrokken accounts)
- **Reviews verzamelen** na elke order (mail 2 weken na levering)
- **Ads**: pas starten als conversie en marge bekend zijn; begin met een klein budget

Open: budget per maand: €__, belangrijkste kanaal: __

## 8. Kleuren en stijl (voorstel, uiteindelijk bepaald door het logo)

Sfeer: natuurlijk, vers, ambachtelijk, eerlijk.

| Rol | Voorstel |
|---|---|
| Primair (donkergroen) | `#2F5D3A` |
| Accent (frisgroen) | `#7FB069` |
| Achtergrond (warm gebroken wit) | `#FAF7F0` |
| Tekst | `#1F2A24` |
| Secundair accent (aarde/terracotta) | `#C26B3E` |

- Typografie: serif voor koppen (verhaal, warmte), schone sans-serif voor tekst
- Veel witruimte, grote productfoto's, afgeronde hoeken, subtiele animaties
- **Zodra het logo er is, kleuren hieruit afleiden** en dit blok aanpassen.

## 9. Benodigde input van de ondernemer

- [ ] Logo (SVG/PNG, transparant) en eventuele huisstijl
- [ ] Productfoto's (liefst op neutrale achtergrond + sfeerbeelden), minimaal 1200px breed
- [ ] Productteksten, ingrediënten, herkomst, allergenen, gewichten, prijzen
- [ ] Tekst "Over ons / waarom we begonnen"
- [ ] Verzendtarieven en -voorwaarden, retourbeleid
- [ ] Bedrijfsgegevens (naam, KvK, btw, adres, e-mail, telefoon)

## 10. Werkafspraken Lovable ↔ GitHub ↔ Claude Code

- `main` is de branch die met Lovable synchroniseert: Claude pusht daar direct naar toe (solo-project, geen PR-ronde nodig); grotere of risicovolle onderdelen (betaling, admin) eerst op een feature-branch en dan mergen
- Lovable-chat bewust **niet** gebruiken (kost credits); wijzigingen via Claude. Wordt er toch iets in Lovable zelf aangepast, dan eerst `git pull` voordat Claude verder bouwt
- Eén fase = één of meer PR's, niet alles tegelijk
- Geheime sleutels (Mollie/Stripe, Resend) **nooit in de frontendcode of repo**: alleen als secrets in Supabase edge functions
- Na elke fase: dit bestand bijwerken (status + logboek)
- Backend (Supabase): eigen Supabase-project koppelen in plaats van Lovable Cloud aan te zetten, zodat Claude migraties en edge functions zelf kan beheren

## 11. Beslissingenlog

| Datum | Beslissing | Reden |
|---|---|---|
| 2026-10-17 | Plan opgesteld | Start |
| 2026-10-17 | Launch-scope: alleen NL-verkoop, handmatige verzending, site in NL + EN, 5 producten met 1 variant, domein anetkruiden.nl | Antwoorden op open vragen van de ondernemer |
| 2026-10-17 | Naam en domein gecorrigeerd: bedrijf heet Anetkruiden, domein anetkruiden.nl is al gekocht (eerder stond per abuis netkruiden.nl) | Correctie van de ondernemer |
| 2026-10-17 | Ontwerp gebaseerd op de opbouw van upfront.nl (alleen als stijlreferentie), vertaald naar eigen merkstijl; zie DESIGN.md | Opdracht van de ondernemer |
| 2026-10-17 | Site staat op `noindex` en lettertypes zijn lokaal gehost | Voorbeeldteksten niet in zoekmachines; geen verbinding met Google-servers (AVG) |
| 2026-10-17 | Contactformulier en nieuwsbrief uitgesteld tot er een backend is | Een formulier zonder werkende verwerking zou misleidend zijn |
| 2026-10-17 | Werkwijze: Claude bouwt de code direct in de GitHub-repo en pusht naar main; Lovable alleen als gekoppelde preview, geen Lovable-chat | Geen Lovable-credits verbruiken |
| 2026-10-17 | Betaalprovider: Mollie (niet Stripe); koppeling via Supabase edge function + webhook, geheime sleutel alleen als Supabase-secret | Keuze van de ondernemer |
| 2026-10-17 | Hosting: Cloudflare (niet Lovable-hosting); bij de domeinaanbieder alleen het domein kopen (hostingpakket "Geen") | Keuze van de ondernemer |
| 2026-10-17 | MVP: blog en productteksten alleen in het Nederlands; interface wel NL + EN | Minder werk bij de start |
| 2026-10-17 | Blog wordt beheerd vanuit dezelfde admin als de orders (blogbeheer, concept/publiceren); gebouwd in fase 5 | Ondernemer wil zelf posts kunnen plaatsen |
| 2026-10-17 | Aanvullende pagina's 9 t/m 15 (FAQ, Verzending en retour, Juridisch, Blog, Reviews, 404, Bestelling volgen) opgenomen in de scope | Akkoord van de ondernemer |

## 12. Logboek

- 2026-10-17: Fase 1 t/m 3 gebouwd in de repo: layout, NL/EN, winkelmand (lokaal), 5 voorbeeldproducten met grote productpagina's, contentpagina's. Zie DESIGN.md.
- 2026-10-17: Lovable-project Anetkruiden aangemaakt (lege TanStack Start-template) en gekoppeld aan GitHub-repo MeesBoskamp/Anetkruiden.
- 2026-10-17: PLAN.md aangemaakt. Nog niets gebouwd.
