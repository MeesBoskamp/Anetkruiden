-- Product 3: Kamille (19-11), opgezet als de oregano, met de kraftzak-animatie.
-- Vereist migratie 20261119090000_productanimatie. Prijs en voorraad nog bevestigen.
-- De voorbeeldproducten schuiven één plek op, zodat kamille als derde product staat.
update public.anet_products set sort_order = sort_order + 1
where sort_order >= 3 and slug <> 'kamille';

insert into public.anet_products (
  slug, name, short_description, price_cents, stock, images, sort_order, is_visible, is_example,
  tagline, size, story, facts, ingredients, storage, packaging, usage, tip, faq,
  animation, animation_labels
) values (
  'kamille',
  'Kamille',
  'Hele, gedroogde kamillebloemen in een papieren zakje met venster. Voor een heerlijk kopje kruidenthee.',
  495,
  10,
  '[{"url": "/images/product-kamille/kamille-voorkant.jpg", "alt": "Kraftpapieren zakje met venster vol gedroogde kamillebloemen, van voren"}, {"url": "/images/product-kamille/kamille-met-pot.jpg", "alt": "Het zakje kamille naast een glazen pot met gedroogde kamille"}, {"url": "/images/product-kamille/kamille-achterkant.jpg", "alt": "Achterkant van het kraftpapieren zakje"}, {"url": "/images/product-kamille/kamille-zijkant.jpg", "alt": "Zijaanzicht van het zakje met losse kamillebloemen op tafel"}, {"url": "/images/product-kamille/kamille-zijkant-venster.jpg", "alt": "Het zakje schuin van opzij, met het venster zichtbaar"}]'::jsonb,
  3,
  true,
  true,
  'Gedroogde kamillebloemen voor een kopje thee.',
  '10 g',
  'Kamille was een van de eerste kruiden die ik in mijn kruidentuin in het Naardermeer kon oogsten. Thuis droogde ik de bloemen, en zo ontdekte ik hoe leuk het is om van je eigen oogst iets te maken.',
  '[{"label": "Inhoud", "value": "10 g"}, {"label": "Verpakking", "value": "Papieren zakje"}]'::jsonb,
  'Gedroogde kamillebloemen.',
  'Koel, droog en donker bewaren.',
  'Papieren zakje',
  '[{"title": "Thee zetten", "body": "Doe een theelepel bloemen in een theezeefje, giet er heet water op en laat het ongeveer 5 minuten trekken."}, {"title": "Met iets erbij", "body": "Lekker met een schijfje citroen of een beetje honing."}]'::jsonb,
  'Dek je kopje af terwijl de thee trekt, dan blijft de geur beter in de thee.',
  '[{"q": "Wanneer wordt mijn bestelling verzonden?", "a": "Ik pak en verstuur elke bestelling zelf. [Levertijd nog invullen.]"}]'::jsonb,
  'kamille',
  '[]'::jsonb
)
on conflict (slug) do nothing;
