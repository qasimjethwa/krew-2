-- =============================================================================
-- KREW — initial schema
-- Fitness & activity-based social matching platform
--
-- Design notes
--  * Every table lives in `public` with Row Level Security enabled.
--  * Users never read another user's raw rows. Other people's data is only
--    exposed through SECURITY DEFINER functions that return a safe projection
--    (age instead of date of birth, rounded distance instead of coordinates,
--    contact details only after an accepted connection).
--  * Writes that span several tables or must enforce business rules
--    (saving activities/goals, finishing onboarding, sending/answering a
--    connection) go through functions so they are atomic and validated
--    server-side, whatever the client sends.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.gender_identity   as enum ('woman', 'man', 'non_binary', 'other');
create type public.fitness_level     as enum ('beginner', 'intermediate', 'advanced');
create type public.travel_radius     as enum ('1_2_km', '2_5_km', '5_plus_km');
create type public.gender_preference as enum ('same_gender', 'no_preference');
create type public.availability_slot as enum ('morning', 'afternoon', 'evening', 'weekends');
create type public.connection_status as enum ('pending', 'accepted', 'declined', 'cancelled');
create type public.app_role          as enum ('admin');

-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Minimum age to use KREW (people meet in person). Change here + lib/constants.ts.
create or replace function public.min_age_years()
returns int language sql immutable set search_path = '' as $$ select 18 $$;

create or replace function public.age_years(dob date)
returns int language sql stable set search_path = '' as $$
  select extract(year from age(current_date, dob))::int
$$;

-- Upper bound (km) for each travel radius option. "5+ km" is capped at 25 km.
create or replace function public.radius_km(r public.travel_radius)
returns numeric language sql immutable set search_path = '' as $$
  select case r
    when '1_2_km'    then 2::numeric
    when '2_5_km'    then 5::numeric
    when '5_plus_km' then 25::numeric
  end
$$;

-- Great-circle distance in kilometres (haversine). Avoids a PostGIS dependency.
create or replace function public.haversine_km(lat1 float8, lon1 float8, lat2 float8, lon2 float8)
returns float8 language sql immutable strict set search_path = '' as $$
  select 2 * 6371 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2)
  ))
$$;

-- -----------------------------------------------------------------------------
-- Lookup tables: activities & goals (predefined options)
-- -----------------------------------------------------------------------------
create table public.activities (
  slug        text primary key check (slug ~ '^[a-z0-9_]{2,40}$'),
  label       text not null check (char_length(label) between 1 and 40),
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.goals (
  slug        text primary key check (slug ~ '^[a-z0-9_]{2,40}$'),
  label       text not null check (char_length(label) between 1 and 40),
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.activities (slug, label, sort_order) values
  ('running',    'Running',    10),
  ('gym',        'Gym',        20),
  ('cycling',    'Cycling',    30),
  ('badminton',  'Badminton',  40),
  ('tennis',     'Tennis',     50),
  ('pickleball', 'Pickleball', 60),
  ('swimming',   'Swimming',   70),
  ('dance',      'Dance',      80),
  ('football',   'Football',   90),
  ('yoga',       'Yoga',       100);

insert into public.goals (slug, label, sort_order) values
  ('get_fitter',      'Get fitter',       10),
  ('stay_consistent', 'Stay consistent',  20),
  ('try_new_sport',   'Try a new sport',  30),
  ('meet_new_people', 'Meet new people',  40);

-- -----------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id                        uuid primary key references auth.users (id) on delete cascade,
  full_name                 text check (full_name is null or char_length(btrim(full_name)) between 1 and 80),
  date_of_birth             date,
  gender                    public.gender_identity,
  bio                       text check (bio is null or char_length(bio) <= 150),
  -- Path inside the `avatars` storage bucket; must live in the owner's folder.
  avatar_path               text check (avatar_path is null or avatar_path like id::text || '/%'),
  -- Picture supplied by an OAuth provider (e.g. Google). Set by trigger only.
  external_avatar_url       text check (external_avatar_url is null or external_avatar_url ~ '^https://'),
  fitness_level             public.fitness_level,
  availability              public.availability_slot[] not null default '{}',
  gender_preference         public.gender_preference,
  require_contact_approval  boolean,
  custom_activity           text check (custom_activity is null or char_length(btrim(custom_activity)) between 2 and 40),
  custom_goal               text check (custom_goal is null or char_length(btrim(custom_goal)) between 2 and 40),
  onboarding_completed_at   timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint profiles_dob_range check (
    date_of_birth is null or (date_of_birth > date '1900-01-01')
  )
);

create index profiles_onboarded_idx on public.profiles (onboarding_completed_at) where onboarding_completed_at is not null;
create index profiles_gender_idx    on public.profiles (gender);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Enforce minimum age on write (a CHECK constraint can't safely use current_date).
create or replace function public.profiles_validate()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.date_of_birth is not null then
    if new.date_of_birth > current_date then
      raise exception 'date_of_birth_in_future' using errcode = '22023';
    end if;
    if public.age_years(new.date_of_birth) < public.min_age_years() then
      raise exception 'under_min_age' using errcode = '22023';
    end if;
  end if;
  if new.availability is not null and cardinality(new.availability) > 4 then
    raise exception 'invalid_availability' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger profiles_validate
  before insert or update on public.profiles
  for each row execute function public.profiles_validate();

-- Profile activities / goals (predefined options, many-to-many)
create table public.profile_activities (
  profile_id    uuid not null references public.profiles (id) on delete cascade,
  activity_slug text not null references public.activities (slug) on update cascade,
  created_at    timestamptz not null default now(),
  primary key (profile_id, activity_slug)
);
create index profile_activities_slug_idx on public.profile_activities (activity_slug);

create table public.profile_goals (
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  goal_slug   text not null references public.goals (slug) on update cascade,
  created_at  timestamptz not null default now(),
  primary key (profile_id, goal_slug)
);
create index profile_goals_slug_idx on public.profile_goals (goal_slug);

-- Location (private: never readable by other users)
create table public.user_locations (
  user_id        uuid primary key references public.profiles (id) on delete cascade,
  pincode        text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  area_name      text check (area_name is null or char_length(area_name) <= 120),
  city           text check (city is null or char_length(city) <= 120),
  latitude       float8 not null check (latitude between -90 and 90),
  longitude      float8 not null check (longitude between -180 and 180),
  travel_radius  public.travel_radius not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index user_locations_lat_lng_idx on public.user_locations (latitude, longitude);

create trigger user_locations_set_updated_at
  before update on public.user_locations
  for each row execute function public.set_updated_at();

-- Contact details (private: shared only with accepted connections via get_match)
create table public.profile_contacts (
  user_id      uuid primary key references public.profiles (id) on delete cascade,
  phone        text check (phone is null or phone ~ '^\+?[0-9][0-9 ]{6,17}$'),
  instagram    text check (instagram is null or instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  share_email  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger profile_contacts_set_updated_at
  before update on public.profile_contacts
  for each row execute function public.set_updated_at();

-- Connections between two users
create table public.connections (
  id              uuid primary key default gen_random_uuid(),
  requester_id    uuid not null references public.profiles (id) on delete cascade,
  recipient_id    uuid not null references public.profiles (id) on delete cascade,
  status          public.connection_status not null default 'pending',
  activity_label  text check (activity_label is null or char_length(activity_label) <= 40),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  responded_at    timestamptz,
  constraint connections_not_self check (requester_id <> recipient_id)
);

-- At most one live (pending/accepted) connection per pair, in either direction.
create unique index connections_live_pair_uidx
  on public.connections (least(requester_id, recipient_id), greatest(requester_id, recipient_id))
  where status in ('pending', 'accepted');
create index connections_recipient_status_idx on public.connections (recipient_id, status);
create index connections_requester_status_idx on public.connections (requester_id, status);

create trigger connections_set_updated_at
  before update on public.connections
  for each row execute function public.set_updated_at();

-- Skipped profiles (hidden from discovery for a cooling-off period)
create table public.skips (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  skipped_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, skipped_id),
  constraint skips_not_self check (user_id <> skipped_id)
);

-- Roles (admin). Only writable with the service role / SQL editor.
create table public.user_roles (
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        public.app_role not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, role)
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = (select auth.uid()) and r.role = 'admin'
  )
$$;

-- -----------------------------------------------------------------------------
-- New user → profile row
-- -----------------------------------------------------------------------------
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
  insert into public.profiles (id, full_name, external_avatar_url)
  values (
    new.id,
    left(v_name, 80),
    case when v_avatar ~ '^https://' then v_avatar else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.activities         enable row level security;
alter table public.goals              enable row level security;
alter table public.profiles           enable row level security;
alter table public.profile_activities enable row level security;
alter table public.profile_goals      enable row level security;
alter table public.user_locations     enable row level security;
alter table public.profile_contacts   enable row level security;
alter table public.connections        enable row level security;
alter table public.skips              enable row level security;
alter table public.user_roles         enable row level security;

-- Lookups: public read
create policy "activities are readable" on public.activities
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "goals are readable" on public.goals
  for select to anon, authenticated using (is_active or (select public.is_admin()));

-- Profiles: owner (and admins) only. Other users go through RPCs.
create policy "read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Profile activities / goals: owner only
create policy "manage own activities" on public.profile_activities
  for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
create policy "manage own goals" on public.profile_goals
  for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- Location: owner only
create policy "manage own location" on public.user_locations
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Contacts: owner only
create policy "manage own contacts" on public.profile_contacts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Connections: participants can read. All writes go through RPCs.
create policy "participants read connections" on public.connections
  for select to authenticated
  using (requester_id = (select auth.uid()) or recipient_id = (select auth.uid()) or (select public.is_admin()));

-- Skips: owner only
create policy "manage own skips" on public.skips
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Roles: users may see their own roles
create policy "read own roles" on public.user_roles
  for select to authenticated using (user_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Column / table privileges (defence in depth on top of RLS)
-- -----------------------------------------------------------------------------
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant update (
  full_name, date_of_birth, gender, bio, avatar_path, fitness_level, availability,
  gender_preference, require_contact_approval, custom_activity, custom_goal
) on public.profiles to authenticated;

revoke all on public.profile_activities, public.profile_goals, public.user_locations,
              public.profile_contacts, public.connections, public.skips, public.user_roles
  from anon;
revoke insert, update, delete on public.connections from authenticated;
revoke insert, update, delete on public.user_roles  from authenticated;
revoke insert, update, delete on public.activities, public.goals from anon, authenticated;

