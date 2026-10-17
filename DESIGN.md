# DESIGN.md: Anetkruiden

Ontwerpbrief voor fase 1 t/m 3. Inspiratie: de opbouw en uitstraling van upfront.nl (alleen als stijlreferentie; geen teksten, beeld of merkelementen overnemen). Dit document is levend: pas het aan zodra logo en huisstijl er zijn.

## 1. Wat opvalt aan de referentie

- **Aankondigingsbalk** bovenaan met korte beloftes en pijltjes om te wisselen (lichtgrijs, kleine tekst).
- **Header**: categorieën links, logo gecentreerd, zoeken/account/winkelmand rechts met aantal tussen haakjes. Over de hero heen transparant, daarna egaal.
- **Hero** over de volle breedte: grote foto, donkere gloed, een korte krachtige kop in hoofdletters onderaan en één rechthoekige witte knop.
- **Typografie**: zware, smalle hoofdletterkoppen voor impact; rustige schreefloze tekst voor de rest. Kopjes van secties in gewone zinsopbouw.
- **Vormtaal**: scherpe hoeken (geen ronde knoppen), dunne randen, kleine vierkantjes als accent (■), filter-chips met een dunne rand.
- **Kleur**: zwart, wit en lichtgrijs; de kleur komt uit de productfoto's. Rood/bruin alleen als signaal ("laatste kans").
- **Productkaart**: product op een lichte vlakke achtergrond, gecentreerde tekst, beoordeling, naam, daaronder prijs | inhoud.
- **Homepage-volgorde**: hero, korte welkomstkop, producten, link naar alles, nieuwsbrief, footer met betaallogo's en social.
- **Verhaalpagina** (voor één product): hero met slogan, verhaalblok, tipvak, korte lijst met kerngetallen, "vaak samen gekocht", beoordelingen, korte citaten van klanten.
- **Toon**: informeel ("je"), kort, concreet, liefst met een getal; speels maar niet overdreven.
- **Details**: uitschuifbare winkelmand (drawer), klein sluitbaar nieuwsbriefvakje linksonder.

## 2. Vertaling naar Anetkruiden

Wij hebben **5 producten** in plaats van 71. Dus geen filters, sortering of rasterwisselaar. In plaats daarvan krijgt elk product veel ruimte, zowel op de homepage als op een eigen, uitgebreide pagina.

### Sfeer

Natuurlijk en ambachtelijk, maar met dezelfde strakke, zelfverzekerde bouw: grote beelden, grote koppen, veel ruimte, scherpe vormen.

### Kleuren (merkstijl ANET, afgeleid van etiket, flyer en productfoto's)

Bron van waarheid is het designsysteem "ANET Designsysteem" (Claude Artifact). Tokens staan in `src/styles.css`.

| Token (Tailwind) | Waarde                | Gebruik                                                         |
| ---------------- | --------------------- | --------------------------------------------------------------- |
| `ink`            | `#000000`             | tekst, footer                                                   |
| `brand`          | `#D66211`             | oranje van het etiket: hero en grote vlakken (wit alleen groot) |
| `brand-deep`     | `#B4510C`             | knoppen, links, kleine witte tekst op oranje (wit: 5,1:1)       |
| `calendula`      | `#F0952B`             | accenten, kopjes in de footer                                   |
| `paper`          | `#FFFFFF`             | pagina-achtergrond                                              |
| `cream`          | `#F7F1E8`             | kaartvlakken, secties, aankondigingsbalk                        |
| `kraft` / `oak`  | `#B98B5E` / `#8A5A2B` | warme accenten uit de productfoto's                             |

### Typografie (twee lettertypen, zelf gehost in `public/fonts`)

- **Liberation Serif** (Regular, Italic): alleen het logo en de koppen. Titels zijn cursief en in hoofdletters (`.display`); regels als "MAAK JE EIGEN" gebruiken `.eyebrow`.
- **Lato** (300, 400, 700): alle tekst, knoppen (hoofdletters, vet), rubriekslabels (`.section-label`).

### Vormtaal

- Hoeken: 0 tot 2 px. Dunne randen (1 px). Knoppen rechthoekig: wit op oranje/donker, zwart op licht.
- Een klein vierkantje (■) in merkoranje als terugkerend accent. Op oranje vlakken een dunne witte kaderlijn, zoals op het etiket.
- Veel witruimte, grote beelden, één duidelijke actie per scherm.

## 3. Onderdelen (fase 1)

1. **Aankondigingsbalk**: wisselende korte berichten (bijv. gratis verzending vanaf een bedrag, handmatig verzonden). Teksten in één bestand beheerbaar.
2. **Header**: links Shop, Over ons, Blog; logo gecentreerd; rechts taalschakelaar (NL/EN), winkelmand met aantal. Transparant op de home-hero, egaal bij scrollen. Mobiel: menu in een lade.
3. **Winkelmand-drawer**: schuift in van rechts (de inhoud en afrekenen komen in fase 4; in fase 1 alleen de lege staat).
4. **Footer**: links (Over ons, FAQ, Verzending en retour, Contact), juridische links, betaallogo's later, social-icoontjes later.
5. **Taalschakelaar**: NL en EN voor alle vaste teksten.
6. **404-pagina** in dezelfde stijl.

## 4. Homepage (fase 2)

1. Hero: volledig scherm, beeld (voorlopig kleurvlak/illustratie), kop in hoofdletters, één knop naar de shop.
2. Korte welkomstkop met één zin over het merk.
3. **Productblokken**: per product een groot blok, om en om beeld links/rechts, met naam, één regel, prijs en knop. Dit vervangt het productraster van de referentie, omdat we er maar 5 hebben.
4. Waarom Anetkruiden: drie of vier korte kernpunten met een vierkantje als icoon.
5. Verhaalstrook (korte versie van Over ons) met link.
6. Nieuwsbriefblok.
7. Reviews: alleen tonen zodra er echte beoordelingen zijn. Geen verzonnen reviews.

Overige pagina's in fase 2: Over ons, Contact, FAQ, Verzending en retour, Algemene voorwaarden, Privacy (conceptteksten, vooraf te laten controleren).

## 5. Productpagina (fase 3), groter dan gebruikelijk

Elk product krijgt een eigen, uitgebreide pagina:

1. **Hero**: groot productbeeld, titel in hoofdletters, prijs, inhoud, knop "In winkelmand".
2. **Kerngetallen**: korte rij met feiten (inhoud, herkomst, houdbaarheid, aantal porties).
3. **Het verhaal van dit product**: waar het vandaan komt, hoe het wordt gemaakt.
4. **Ingrediënten en herkomst**: volledig, met allergenen.
5. **Zo gebruik je het**: gebruiksideeën en een korte tip (tipvak).
6. **Veelgestelde vragen** over dit product.
7. **Combineer met**: de andere producten.
8. **Beoordelingen**: pas tonen als er echte zijn.
9. **Vaste knop** onderin op mobiel (prijs + in winkelmand).

Juridisch: geen gezondheidsclaims in productteksten (zie PLAN.md, fase 6).

## 6. Beeld

- Product 1 (Calendulazalf) heeft echte foto's in `public/images/product-1/`. Overige producten: tijdelijk rustige kleurvlakken en eenvoudige illustraties met bladvormen, duidelijk als placeholder te vervangen.
- Zodra de echte foto's er zijn: grote, rustige foto's op `Steen`, sfeerbeelden voor hero's.
- Alle beeld komt uit één map met vaste bestandsnamen per product, zodat vervangen eenvoudig is.
