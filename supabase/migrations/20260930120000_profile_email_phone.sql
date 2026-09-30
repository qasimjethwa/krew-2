-- =============================================================================
-- KREW — email & phone on profiles
--
--  * `email` mirrors the account email in auth.users. It is maintained by
--    triggers only (users can't write it directly), so it always matches the
--    address they sign in with — including Google sign-in.
--  * `phone` is collected during onboarding and is now required to finish it.
--    It is also kept in profile_contacts, which get_match uses to share contact
--    details with accepted connections.
--  * Both columns are nullable so existing rows stay valid.
-- =============================================================================

alter table public.profiles
  add column if not exists email text,
  add column if not exists phone text;

alter table public.profiles
  add constraint profiles_email_format check (email is null or email ~ '^[^@\s]+@[^@\s]+$'),
  add constraint profiles_phone_format check (phone is null or phone ~ '^\+?[0-9]{10,15}$');

-- Backfill: email from auth.users, phone from existing contact details.
update public.profiles p
   set email = u.email
  from auth.users u
 where u.id = p.id
   and p.email is null
   and u.email ~ '^[^@\s]+@[^@\s]+$';

update public.profiles p
   set phone = n.phone
  from (
    select user_id,
           case when btrim(phone) like '+%' then '+' else '' end || regexp_replace(phone, '[^0-9]', '', 'g') as phone
      from public.profile_contacts
     where phone is not null
  ) n
 where n.user_id = p.id
   and p.phone is null
   and n.phone ~ '^\+?[0-9]{10,15}$';

-- New users: copy the account email into the profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name   text := nullif(btrim(coalesce(
                     new.raw_user_meta_data ->> 'full_name',
                     new.raw_user_meta_data ->> 'name', '')), '');
  v_avatar text := coalesce(new.raw_user_meta_data ->> 'avatar_url',
                            new.raw_user_meta_data ->> 'picture');
begin
  insert into public.profiles (id, full_name, external_avatar_url, email)
  values (
    new.id,
    left(v_name, 80),
    case when v_avatar ~ '^https://' then v_avatar else null end,
    case when new.email ~ '^[^@\s]+@[^@\s]+$' then new.email else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Keep the profile email in sync when the account email changes.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
     set email = case when new.email ~ '^[^@\s]+@[^@\s]+$' then new.email else null end
   where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

revoke execute on function public.handle_new_user()          from public, anon, authenticated;
revoke execute on function public.handle_user_email_change() from public, anon, authenticated;

-- Users may update their own phone. The "update own profile" RLS policy
-- already restricts updates to the user's own row; email stays trigger-only.
grant update (phone) on public.profiles to authenticated;

-- Onboarding now also requires an email and a phone number.
create or replace function public.complete_onboarding()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  p     public.profiles;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into p from public.profiles where id = v_uid;
  if not found then raise exception 'profile_missing' using errcode = 'P0002'; end if;

  if p.full_name is null or p.date_of_birth is null or p.gender is null then
    raise exception 'incomplete_profile' using errcode = '22023';
  end if;
  if p.email is null or p.phone is null then
    raise exception 'incomplete_contact' using errcode = '22023';
  end if;
  if not exists (select 1 from public.user_locations where user_id = v_uid) then
    raise exception 'incomplete_location' using errcode = '22023';
  end if;
  if cardinality(public._activity_keys(v_uid)) = 0 then
    raise exception 'incomplete_activities' using errcode = '22023';
  end if;
  if cardinality(public._goal_keys(v_uid)) = 0 or p.fitness_level is null
     or cardinality(p.availability) = 0 then
    raise exception 'incomplete_goals' using errcode = '22023';
  end if;
  if p.gender_preference is null or p.require_contact_approval is null then
    raise exception 'incomplete_preferences' using errcode = '22023';
  end if;

  update public.profiles
     set onboarding_completed_at = coalesce(onboarding_completed_at, now())
   where id = v_uid;
end;
$$;

revoke execute on function public.complete_onboarding() from public, anon;
grant  execute on function public.complete_onboarding() to authenticated;
