-- Applied to the Profound Productions Supabase project (ref ofbitzqczupdobofuosh) on
-- 17 Oct 2026 as migration "za_maid_first_clean_discount". Kept here for reference.
--
-- ZA Maid Group website: one first-clean discount per phone number.
-- Stores only an HMAC of the normalised phone number (no raw numbers), keyed with a
-- secret that lives in a private schema the API cannot reach.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists za_maid_private;
revoke all on schema za_maid_private from public, anon, authenticated;

create table if not exists za_maid_private.settings (
  id boolean primary key default true check (id),
  phone_pepper text not null
);
insert into za_maid_private.settings (phone_pepper)
values (encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (id) do nothing;

create table if not exists public.za_maid_discount_claims (
  phone_hash text primary key,
  first_claimed_at timestamptz not null default now(),
  last_claimed_at timestamptz not null default now(),
  attempts integer not null default 1
);
alter table public.za_maid_discount_claims enable row level security;
revoke all on public.za_maid_discount_claims from anon, authenticated;

-- Returns 'granted', 'already_used' or 'invalid_phone'.
-- The same number may retry within 24 hours of its first claim (e.g. resending the same booking).
create or replace function public.za_maid_claim_first_clean(p_phone text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  pepper text;
  h text;
  first_at timestamptz;
begin
  if digits like '0%' then
    digits := '27' || substr(digits, 2);
  end if;
  if digits !~ '^27[678][0-9]{8}$' then
    return 'invalid_phone';
  end if;

  select s.phone_pepper into pepper from za_maid_private.settings s where s.id;
  h := encode(extensions.hmac(digits, pepper, 'sha256'), 'hex');

  select c.first_claimed_at into first_at from public.za_maid_discount_claims c where c.phone_hash = h;
  if first_at is null then
    insert into public.za_maid_discount_claims (phone_hash) values (h)
    on conflict (phone_hash) do nothing;
    return 'granted';
  end if;

  update public.za_maid_discount_claims
     set last_claimed_at = now(), attempts = attempts + 1
   where phone_hash = h;

  if now() - first_at < interval '24 hours' then
    return 'granted';
  end if;
  return 'already_used';
end;
$$;

revoke all on function public.za_maid_claim_first_clean(text) from public;
grant execute on function public.za_maid_claim_first_clean(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Migration "za_maid_first_clean_discount_hardening" (17 Oct 2026, after security review):
-- * at most 30 NEW claims per hour across all numbers; beyond that the function returns
--   'busy' and the site sends the booking without the discount, asking ZA Maid to check
-- * "+27 (0)71 ..." numbers are accepted (27 0 71... -> 27 71...)
-- * explicit revoke on za_maid_private.settings; index on first_claimed_at
-- The function body above was replaced with the version that adds, before the insert:
--
--   if (select count(*) from public.za_maid_discount_claims c
--        where c.first_claimed_at > now() - interval '1 hour') >= 30 then
--     return 'busy';
--   end if;
--
-- and normalises with:  if digits like '270%' then digits := '27' || substr(digits, 4);
--                       elsif digits like '0%' then digits := '27' || substr(digits, 2); end if;
revoke all on za_maid_private.settings from public, anon, authenticated;
create index if not exists za_maid_discount_claims_first_claimed_at_idx
  on public.za_maid_discount_claims (first_claimed_at);
