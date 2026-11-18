import { createFileRoute, Link } from "@tanstack/react-router";

import { PageShell } from "@/components/site/PageShell";
import { useTr } from "@/lib/i18n";

// Tekst aangeleverd door Annette (18-11-2026). URL blijft /over-ons zodat bestaande links werken.
export const Route = createFileRoute("/over-ons")({
  head: () => ({
    meta: [
      { title: "Over mij | Anetkruiden" },
      {
        name: "description",
        content:
          "Annette over de liefde voor kruiden: van een kruidentuin in Frankrijk tot een eigen kruidentuin in het Naardermeer en ANET.",
      },
    ],
  }),
  component: About,
});

function About() {
  const tr = useTr();
  return (
    <PageShell
      title={tr({ nl: "Over mij", en: "About me" })}
      intro={tr({ nl: "De liefde voor kruiden", en: "A love of herbs" })}
    >
      <div className="grid gap-10 md:grid-cols-2">
        <figure className="!mt-0 md:sticky md:top-24 md:self-start">
          <img
            src="/images/calendula-veld-zwartwit.jpg"
            alt={tr({
              nl: "Goudsbloemen in de kruidentuin",
              en: "Marigolds in the herb garden",
            })}
            className="aspect-[4/5] w-full object-cover"
          />
        </figure>
        <div className="space-y-6">
          <p className="!mt-0">
            {tr({
              nl: "Een paar jaar geleden bezocht ik in Frankrijk een prachtige kruidentuin. Overal groeiden bloemen en kruiden, het rook er heerlijk en tussen de planten zoemden bijen. Een hof van Eden. Bij de tuin werden bijzondere theemengsels en zalven verkocht, allemaal gemaakt van kruiden uit die tuin. Ik vond het geweldig. De sfeer, de geuren, de kleuren en vooral het idee dat je met wat de natuur je geeft zoveel moois kunt maken. Sindsdien speelde ik met de gedachte om zelf zoiets te beginnen.",
              en: "A few years ago I visited a beautiful herb garden in France. Flowers and herbs grew everywhere, it smelled wonderful and bees were buzzing between the plants. A garden of Eden. The garden sold special tea blends and salves, all made from herbs grown there. I loved it. The atmosphere, the scents, the colours and above all the idea that you can make so many beautiful things with what nature gives you. Ever since, I toyed with the idea of starting something like it myself.",
            })}
          </p>
          <p>
            {tr({
              nl: "Begin 2026 kreeg ik de kans om een stukje grond in het Naardermeer om te toveren tot een kruidentuin. Een mooie gelegenheid om mijn ideeën uit te proberen. Ik plantte onder andere kamille, goudsbloem (calendula), korenbloem, citroenmelisse, lavendel en bergamot. En toen was het vooral afwachten wat er zou gebeuren.",
              en: "In early 2026 I got the chance to turn a small plot of land in the Naardermeer into a herb garden. A great opportunity to try out my ideas. Among other things I planted chamomile, marigold (calendula), cornflower, lemon balm, lavender and bergamot. And then it was mostly a matter of waiting to see what would happen.",
            })}
          </p>
          <p>
            {tr({
              nl: "Gelukkig bleken de kruiden het prima naar hun zin te hebben. Ondanks het soms nogal wisselvallige Nederlandse weer groeide en bloeide de tuin volop. Al snel kon ik de eerste kamille oogsten. Thuis droogde ik de bloemen, experimenteerde ik met verschillende kruiden en ontdekte ik hoe leuk het is om van je eigen oogst iets te maken.",
              en: "Luckily the herbs felt right at home. Despite the sometimes rather changeable Dutch weather, the garden grew and bloomed abundantly. Soon I could harvest the first chamomile. At home I dried the flowers, experimented with different herbs and discovered how much fun it is to make something from your own harvest.",
            })}
          </p>

          <h2>{tr({ nl: "Zo ontstond ANET", en: "How ANET came about" })}</h2>
          <p>
            {tr({
              nl: "Wat begon als een experiment in de kruidentuin, groeide uit tot ANET. Onder deze naam maak ik kruidenthee en stel ik DIY-pakketten samen waarmee je zelf aan de slag kunt, bijvoorbeeld om calendulazalf te maken.",
              en: "What started as an experiment in the herb garden grew into ANET. Under this name I make herbal tea and put together DIY kits so you can get started yourself, for example to make calendula salve.",
            })}
          </p>
          <p>
            {tr({
              nl: "Wat ik er zo leuk aan vind, is dat je met iets eenvoudigs als een bloem of een kruid zoveel kunt doen. Van een heerlijk kopje thee tot een zelfgemaakte zalf. En ondertussen is de kruidentuin ook nog eens een fijne plek voor bijen, hommels en vlinders.",
              en: "What I love about it is how much you can do with something as simple as a flower or a herb. From a lovely cup of tea to a homemade salve. And meanwhile the herb garden is also a great place for bees, bumblebees and butterflies.",
            })}
          </p>
          <p>
            {tr({
              nl: "Ik blijf graag ontdekken, uitproberen en nieuwe dingen maken. Niet alles lukt meteen, maar juist dat experimenteren maakt het zo leuk.",
              en: "I love to keep discovering, trying things out and making new things. Not everything works straight away, but that experimenting is exactly what makes it so much fun.",
            })}
          </p>
          <p>
            {tr({
              nl: "Met ANET wil ik die ontdekkingen graag delen. Zodat ook jij kunt genieten van de geuren, smaken en mogelijkheden van kruiden. Of je nu een kopje thee zet of zelf aan de slag gaat met een DIY-pakket.",
              en: "With ANET I'd like to share those discoveries. So that you too can enjoy the scents, flavours and possibilities of herbs. Whether you're making a cup of tea or getting started with a DIY kit.",
            })}
          </p>
          <p>{tr({ nl: "Veel plezier met ontdekken!", en: "Happy discovering!" })}</p>
          <p className="display text-4xl normal-case">Annette</p>
          <p>
            <Link to="/shop" className="btn btn-dark !no-underline">
              {tr({ nl: "Ontdek de producten", en: "Discover the products" })}
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
