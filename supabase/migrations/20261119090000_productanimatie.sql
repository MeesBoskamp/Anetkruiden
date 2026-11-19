-- Productanimatie: een draaiende kraftzak bovenaan de productpagina, met de foto's eronder.
-- animation: welke animatie (nu alleen 'kamille'); leeg = geen animatie, alleen foto's.
-- animation_labels: de korte teksten naast de zak na een klik op "Ingrediënten" (max. 6).
alter table public.anet_products
  add column animation text check (animation is null or animation in ('kamille')),
  add column animation_labels jsonb not null default '[]'::jsonb
    check (jsonb_typeof(animation_labels) = 'array' and jsonb_array_length(animation_labels) <= 6);
