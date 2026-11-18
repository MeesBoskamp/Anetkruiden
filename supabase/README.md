# Database (Supabase)

De tabellen van ANET staan in het Supabase-project **trainingcoach** (`yelbybdesdjsynzdfrit`),
maar volledig los van de trainingcoach-tabellen: alles heeft het voorvoegsel `anet_`
(tabellen, functies, type) en foto's staan in de opslagbucket `anet-product-images`.

- `anet_products`: producten, voorraad, volgorde, foto's en alle optionele velden
- `anet_orders`, `anet_order_items`, `anet_order_events`: bestellingen, regels en statushistorie
- `anet_admin_emails`: wie beheerder is (een bevestigd account met een e-mailadres op deze lijst)

Rechten lopen via row level security en `anet_is_admin()`. Bezoekers zien alleen producten
die op "zichtbaar" staan; bestellingen zijn alleen voor beheerders.

Beheerder toevoegen (SQL-editor in Supabase):

```sql
insert into public.anet_admin_emails (email) values ('naam@voorbeeld.nl');
```

De persoon logt daarna in op `/beheer` met een account in dit Supabase-project.

Let op: de inlogaccounts (Supabase Auth) zijn gedeeld met trainingcoach. Een account geeft
alleen beheerrechten als het e-mailadres op de beheerderslijst staat.
