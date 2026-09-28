-- -----------------------------------------------------------------------------
-- Internal helpers (not callable by clients)
-- -----------------------------------------------------------------------------
create or replace function public._activity_keys(p uuid)
returns text[] language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(k order by k), '{}') from (
    select pa.activity_slug as k from public.profile_activities pa where pa.profile_id = p
    union
    select 'custom:' || lower(btrim(pr.custom_activity))
      from public.profiles pr where pr.id = p and pr.custom_activity is not null
  ) s
$$;

create or replace function public._goal_keys(p uuid)
returns text[] language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(k order by k), '{}') from (
    select pg.goal_slug as k from public.profile_goals pg where pg.profile_id = p
    union
    select 'custom:' || lower(btrim(pr.custom_goal))
      from public.profiles pr where pr.id = p and pr.custom_goal is not null
  ) s
$$;

-- [{key, label}] ordered for display
create or replace function public._activity_list(p uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('key', k, 'label', l) order by o), '[]'::jsonb) from (
    select a.slug as k, a.label as l, a.sort_order as o
      from public.profile_activities pa join public.activities a on a.slug = pa.activity_slug
     where pa.profile_id = p
    union all
    select 'custom:' || lower(btrim(pr.custom_activity)), btrim(pr.custom_activity), 100000
      from public.profiles pr where pr.id = p and pr.custom_activity is not null
  ) s
$$;

create or replace function public._goal_list(p uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('key', k, 'label', l) order by o), '[]'::jsonb) from (
    select g.slug as k, g.label as l, g.sort_order as o
      from public.profile_goals pg join public.goals g on g.slug = pg.goal_slug
     where pg.profile_id = p
    union all
    select 'custom:' || lower(btrim(pr.custom_goal)), btrim(pr.custom_goal), 100000
      from public.profiles pr where pr.id = p and pr.custom_goal is not null
  ) s
$$;

create or replace function public._overlap_ratio(a text[], b text[])
returns numeric language sql immutable set search_path = '' as $$
  select case
    when coalesce(cardinality(a), 0) = 0 or coalesce(cardinality(b), 0) = 0 then 0::numeric
    else (select count(*) from (select unnest(a) intersect select unnest(b)) x)::numeric
         / least(cardinality(a), cardinality(b))
  end
$$;

-- Compatibility score (0–100).
-- Weights are provisional until the client confirms the final formula
-- (Scope §6 / §10). Keep in sync with docs in README "Matching logic".
--   activities 40% · goals 20% · fitness level 15% · schedule 15% · proximity 10%
create or replace function public._compat_score(
  a_acts text[], b_acts text[],
  a_goals text[], b_goals text[],
  a_level public.fitness_level, b_level public.fitness_level,
  a_slots public.availability_slot[], b_slots public.availability_slot[],
  distance_km numeric, radius_km numeric
) returns int language sql immutable set search_path = '' as $$
  select round(100 * (
      0.40 * public._overlap_ratio(a_acts, b_acts)
    + 0.20 * public._overlap_ratio(a_goals, b_goals)
    + 0.15 * (case
                when a_level is null or b_level is null then 0
                when a_level = b_level then 1
                when abs(array_position(enum_range(null::public.fitness_level), a_level)
                       - array_position(enum_range(null::public.fitness_level), b_level)) = 1 then 0.5
                else 0 end)
    + 0.15 * public._overlap_ratio(a_slots::text[], b_slots::text[])
    + 0.10 * greatest(0, 1 - coalesce(distance_km, radius_km) / nullif(radius_km, 0))
  ))::int
$$;

create or replace function public._gender_ok(
  a_gender public.gender_identity, a_pref public.gender_preference,
  b_gender public.gender_identity, b_pref public.gender_preference
) returns boolean language sql immutable set search_path = '' as $$
  select (a_pref = 'no_preference' or a_gender = b_gender)
     and (b_pref = 'no_preference' or a_gender = b_gender)
$$;

create or replace function public._shared_labels(a uuid, b uuid)
returns text[] language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(x ->> 'label' order by ord), '{}')
    from jsonb_array_elements(public._activity_list(b)) with ordinality as t(x, ord)
   where (x ->> 'key') = any (public._activity_keys(a))
$$;

revoke execute on function public._activity_keys(uuid)  from public, anon, authenticated;
revoke execute on function public._goal_keys(uuid)      from public, anon, authenticated;
revoke execute on function public._activity_list(uuid)  from public, anon, authenticated;
revoke execute on function public._goal_list(uuid)      from public, anon, authenticated;
revoke execute on function public._shared_labels(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user()     from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Onboarding RPCs (SECURITY INVOKER: RLS applies)
-- -----------------------------------------------------------------------------
create or replace function public.save_activities(p_slugs text[], p_custom text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_custom text := nullif(btrim(coalesce(p_custom, '')), '');
  v_count  int;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '42501'; end if;

  p_slugs := coalesce(p_slugs, '{}');
  select count(*) into v_count from public.activities a
   where a.slug = any (p_slugs) and a.is_active;
  if v_count <> cardinality(array(select distinct unnest(p_slugs))) then
    raise exception 'invalid_activity' using errcode = '22023';
  end if;
  if v_count = 0 and v_custom is null then
    raise exception 'activity_required' using errcode = '22023';
  end if;

  delete from public.profile_activities where profile_id = v_uid;
  insert into public.profile_activities (profile_id, activity_slug)
    select v_uid, s from (select distinct unnest(p_slugs) as s) d;
  update public.profiles set custom_activity = v_custom where id = v_uid;
end;
$$;

create or replace function public.save_goals_and_schedule(
  p_goal_slugs text[],
  p_custom_goal text,
  p_fitness_level public.fitness_level,
  p_availability public.availability_slot[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_custom text := nullif(btrim(coalesce(p_custom_goal, '')), '');
  v_count  int;
  v_total  int;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '42501'; end if;

  p_goal_slugs := coalesce(p_goal_slugs, '{}');
  select count(*) into v_count from public.goals g
   where g.slug = any (p_goal_slugs) and g.is_active;
  if v_count <> cardinality(array(select distinct unnest(p_goal_slugs))) then
    raise exception 'invalid_goal' using errcode = '22023';
  end if;
  v_total := v_count + (case when v_custom is null then 0 else 1 end);
  if v_total = 0 then raise exception 'goal_required'  using errcode = '22023'; end if;
  if v_total > 2 then raise exception 'too_many_goals' using errcode = '22023'; end if;
  if p_fitness_level is null then raise exception 'fitness_level_required' using errcode = '22023'; end if;
  if p_availability is null or cardinality(p_availability) = 0 then
    raise exception 'availability_required' using errcode = '22023';
  end if;

  delete from public.profile_goals where profile_id = v_uid;
  insert into public.profile_goals (profile_id, goal_slug)
    select v_uid, s from (select distinct unnest(p_goal_slugs) as s) d;
  update public.profiles
     set custom_goal   = v_custom,
         fitness_level = p_fitness_level,
         availability  = array(select distinct unnest(p_availability) order by 1)
   where id = v_uid;
end;
$$;

-- Marks onboarding complete once every required attribute is present.
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

-- -----------------------------------------------------------------------------
-- Discovery
-- -----------------------------------------------------------------------------
create or replace function public.discover_profiles(
  p_activity      text default null,                      -- activity key (slug or custom:<label>)
  p_fitness_level public.fitness_level default null,
  p_availability  public.availability_slot default null,
  p_max_km        numeric default null,
  p_limit         int default 24,
  p_offset        int default 0
)
returns table (
  user_id              uuid,
  full_name            text,
  age                  int,
  avatar_path          text,
  external_avatar_url  text,
  bio                  text,
  area_name            text,
  city                 text,
  distance_km          numeric,
  fitness_level        public.fitness_level,
  availability         public.availability_slot[],
  activities           jsonb,
  goals                jsonb,
  shared_activities    text[],
  match_percent        int
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  me      record;
  v_limit numeric;
  v_dlat  float8;
  v_dlng  float8;
  my_acts text[];
  my_goals text[];
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '42501'; end if;

  select p.id, p.gender, p.gender_preference, p.fitness_level, p.availability,
         l.latitude, l.longitude, public.radius_km(l.travel_radius) as rkm
    into me
    from public.profiles p join public.user_locations l on l.user_id = p.id
   where p.id = v_uid and p.onboarding_completed_at is not null;
  if not found then return; end if;

  v_limit := least(coalesce(p_max_km, me.rkm), me.rkm);
  v_dlat  := v_limit / 111.0;
  v_dlng  := v_limit / greatest(111.0 * cos(radians(me.latitude)), 0.0001);
  my_acts  := public._activity_keys(v_uid);
  my_goals := public._goal_keys(v_uid);

  return query
  with cands as (
    select c.id, c.full_name, c.date_of_birth, c.avatar_path, c.external_avatar_url, c.bio,
           c.fitness_level as lvl, c.availability as slots,
           l.area_name, l.city,
           round(public.haversine_km(me.latitude, me.longitude, l.latitude, l.longitude)::numeric, 1) as dist,
           public.radius_km(l.travel_radius) as crkm
      from public.profiles c
      join public.user_locations l on l.user_id = c.id
     where c.id <> v_uid
       and c.onboarding_completed_at is not null
       and l.latitude  between me.latitude  - v_dlat and me.latitude  + v_dlat
       and l.longitude between me.longitude - v_dlng and me.longitude + v_dlng
       and public._gender_ok(me.gender, me.gender_preference, c.gender, c.gender_preference)
       and (p_fitness_level is null or c.fitness_level = p_fitness_level)
       and (p_availability  is null or p_availability = any (c.availability))
       and not exists (select 1 from public.skips s
                        where s.user_id = v_uid and s.skipped_id = c.id
                          and s.created_at > now() - interval '30 days')
       and not exists (select 1 from public.connections x
                        where x.status <> 'cancelled'
                          and ((x.requester_id = v_uid and x.recipient_id = c.id)
                            or (x.requester_id = c.id and x.recipient_id = v_uid)))
  ), scored as (
    select k.*, public._activity_keys(k.id) as acts, public._goal_keys(k.id) as gls
      from cands k
     where k.dist <= v_limit and k.dist <= k.crkm
  )
  select s.id, s.full_name, public.age_years(s.date_of_birth), s.avatar_path, s.external_avatar_url,
         s.bio, s.area_name, s.city, s.dist, s.lvl, s.slots,
         public._activity_list(s.id), public._goal_list(s.id),
         public._shared_labels(v_uid, s.id),
         public._compat_score(my_acts, s.acts, my_goals, s.gls, me.fitness_level, s.lvl,
                              me.availability, s.slots, s.dist, me.rkm)
    from scored s
   where p_activity is null or p_activity = any (s.acts)
   order by 15 desc, s.dist asc, s.id
   limit least(greatest(coalesce(p_limit, 24), 1), 50)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

-- Full profile of another user (or yourself), with proximity + connection state.
create or replace function public.get_profile(p_user uuid)
returns table (
  user_id              uuid,
  full_name            text,
  age                  int,
  avatar_path          text,
  external_avatar_url  text,
  bio                  text,
  area_name            text,
  city                 text,
  distance_km          numeric,
  fitness_level        public.fitness_level,
  availability         public.availability_slot[],
  activities           jsonb,
  goals                jsonb,
  shared_activities    text[],
  match_percent        int,
  connection_id        uuid,
  connection_status    text,     -- none | pending | accepted | unavailable
  connection_direction text      -- sent | received | null
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  me    record;
  t     record;
  cx    public.connections;
  v_dist numeric;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '42501'; end if;

  select p.*, l.latitude, l.longitude, l.area_name as l_area, l.city as l_city,
         public.radius_km(l.travel_radius) as rkm
    into me from public.profiles p left join public.user_locations l on l.user_id = p.id
   where p.id = v_uid;
  select p.*, l.latitude, l.longitude, l.area_name as l_area, l.city as l_city
    into t from public.profiles p left join public.user_locations l on l.user_id = p.id
   where p.id = p_user and (p.onboarding_completed_at is not null or p.id = v_uid);
  if t.id is null then return; end if;

  select * into cx from public.connections c
   where c.status <> 'cancelled'
     and ((c.requester_id = v_uid and c.recipient_id = p_user)
       or (c.requester_id = p_user and c.recipient_id = v_uid))
   order by (c.status in ('pending', 'accepted')) desc, c.created_at desc
   limit 1;

  -- Visible if it is you, you share a connection, or you'd be eligible to match.
  if p_user <> v_uid and cx.id is null
     and not coalesce(public._gender_ok(me.gender, me.gender_preference, t.gender, t.gender_preference), false) then
    return;
  end if;

  if me.latitude is not null and t.latitude is not null then
    v_dist := round(public.haversine_km(me.latitude, me.longitude, t.latitude, t.longitude)::numeric, 1);
  end if;

  return query select
    t.id, t.full_name, public.age_years(t.date_of_birth), t.avatar_path, t.external_avatar_url,
    t.bio, t.l_area, t.l_city, v_dist, t.fitness_level, t.availability,
    public._activity_list(t.id), public._goal_list(t.id),
    case when p_user = v_uid then '{}'::text[] else public._shared_labels(v_uid, t.id) end,
    case when p_user = v_uid then null else
      public._compat_score(public._activity_keys(v_uid), public._activity_keys(t.id),
                           public._goal_keys(v_uid), public._goal_keys(t.id),
                           me.fitness_level, t.fitness_level, me.availability, t.availability,
                           v_dist, coalesce(me.rkm, 5)) end,
    cx.id,
    case when cx.id is null then 'none'
         when cx.status = 'declined' then 'unavailable'
         else cx.status::text end,
    case when cx.id is null or cx.status = 'declined' then null
         when cx.requester_id = v_uid then 'sent' else 'received' end;
end;
$$;

-- -----------------------------------------------------------------------------
-- Connections
-- -----------------------------------------------------------------------------
-- Sends a request. If the recipient doesn't require approval, or has already
-- sent you a request, the connection is accepted immediately.
create or replace function public.send_connection(p_target uuid)
returns table (connection_id uuid, status public.connection_status)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  me      public.profiles;
  t       public.profiles;
  cx      public.connections;
  v_label text;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if p_target = v_uid then raise exception 'cannot_connect_self' using errcode = '22023'; end if;

  select * into me from public.profiles where id = v_uid;
  if me.onboarding_completed_at is null then
    raise exception 'onboarding_incomplete' using errcode = '42501';
  end if;
  select * into t from public.profiles where id = p_target and onboarding_completed_at is not null;
  if t.id is null or not public._gender_ok(me.gender, me.gender_preference, t.gender, t.gender_preference) then
    raise exception 'profile_unavailable' using errcode = 'P0002';
  end if;

  -- Existing live connection?
  select * into cx from public.connections c
   where c.status in ('pending', 'accepted')
     and ((c.requester_id = v_uid and c.recipient_id = p_target)
       or (c.requester_id = p_target and c.recipient_id = v_uid))
   for update;

  if cx.id is not null then
    if cx.status = 'pending' and cx.recipient_id = v_uid then
      update public.connections c set status = 'accepted', responded_at = now()
       where c.id = cx.id returning * into cx;
    end if;
    return query select cx.id, cx.status;
    return;
  end if;

  if exists (select 1 from public.connections c
              where c.status = 'declined'
                and ((c.requester_id = v_uid and c.recipient_id = p_target)
                  or (c.requester_id = p_target and c.recipient_id = v_uid))) then
    raise exception 'profile_unavailable' using errcode = 'P0002';
  end if;

  v_label := (public._shared_labels(v_uid, p_target))[1];

  insert into public.connections (requester_id, recipient_id, status, activity_label, responded_at)
  values (
    v_uid, p_target,
    case when coalesce(t.require_contact_approval, true) then 'pending'::public.connection_status
         else 'accepted'::public.connection_status end,
    v_label,
    case when coalesce(t.require_contact_approval, true) then null else now() end
  )
  returning * into cx;

  delete from public.skips s where s.user_id = v_uid and s.skipped_id = p_target;
  return query select cx.id, cx.status;
end;
$$;

create or replace function public.respond_connection(p_connection uuid, p_accept boolean)
returns public.connection_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  cx    public.connections;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  update public.connections c
     set status = case when p_accept then 'accepted'::public.connection_status
                       else 'declined'::public.connection_status end,
         responded_at = now()
   where c.id = p_connection and c.recipient_id = v_uid and c.status = 'pending'
  returning * into cx;
  if cx.id is null then raise exception 'request_not_found' using errcode = 'P0002'; end if;
  return cx.status;
end;
$$;

create or replace function public.cancel_connection(p_connection uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  update public.connections c set status = 'cancelled', responded_at = now()
   where c.id = p_connection and c.requester_id = v_uid and c.status = 'pending'
  returning c.id into v_id;
  if v_id is null then raise exception 'request_not_found' using errcode = 'P0002'; end if;
end;
$$;

-- box: 'received' (pending, to me) | 'sent' (pending, from me) | 'connected' (accepted)
create or replace function public.list_connections(p_box text)
returns table (
  connection_id        uuid,
  status               public.connection_status,
  direction            text,
  other_id             uuid,
  other_name           text,
  other_age            int,
  other_avatar_path    text,
  other_external_avatar_url text,
  area_name            text,
  distance_km          numeric,
  activities           jsonb,
  goals                jsonb,
  availability         public.availability_slot[],
  activity_label       text,
  created_at           timestamptz,
  responded_at         timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  my_lat float8; my_lng float8;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if p_box not in ('received', 'sent', 'connected') then
    raise exception 'invalid_box' using errcode = '22023';
  end if;
  select l.latitude, l.longitude into my_lat, my_lng from public.user_locations l where l.user_id = v_uid;

  return query
  select c.id, c.status,
         case when c.requester_id = v_uid then 'sent' else 'received' end,
         o.id, o.full_name, public.age_years(o.date_of_birth), o.avatar_path, o.external_avatar_url,
         l.area_name,
         case when my_lat is null or l.latitude is null then null
              else round(public.haversine_km(my_lat, my_lng, l.latitude, l.longitude)::numeric, 1) end,
         public._activity_list(o.id), public._goal_list(o.id), o.availability,
         c.activity_label, c.created_at, c.responded_at
    from public.connections c
    join public.profiles o on o.id = case when c.requester_id = v_uid then c.recipient_id else c.requester_id end
    left join public.user_locations l on l.user_id = o.id
   where (p_box = 'received'  and c.recipient_id = v_uid and c.status = 'pending')
      or (p_box = 'sent'      and c.requester_id = v_uid and c.status = 'pending')
      or (p_box = 'connected' and (c.requester_id = v_uid or c.recipient_id = v_uid) and c.status = 'accepted')
   order by coalesce(c.responded_at, c.created_at) desc
   limit 200;
end;
$$;

create or replace function public.pending_request_count()
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int from public.connections c
   where c.recipient_id = (select auth.uid()) and c.status = 'pending'
$$;

-- Match details, including the other person's contact details.
-- Returns nothing unless the caller is a participant of an ACCEPTED connection.
create or replace function public.get_match(p_connection uuid)
returns table (
  connection_id        uuid,
  my_name              text,
  my_avatar_path       text,
  my_external_avatar_url text,
  other_id             uuid,
  other_name           text,
  other_age            int,
  other_avatar_path    text,
  other_external_avatar_url text,
  area_name            text,
  distance_km          numeric,
  shared_activities    text[],
  shared_goals         text[],
  shared_availability  public.availability_slot[],
  activity_label       text,
  contact_phone        text,
  contact_instagram    text,
  contact_email        text,
  connected_at         timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  cx    public.connections;
  v_other uuid;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into cx from public.connections c
   where c.id = p_connection and c.status = 'accepted'
     and (c.requester_id = v_uid or c.recipient_id = v_uid);
  if cx.id is null then return; end if;
  v_other := case when cx.requester_id = v_uid then cx.recipient_id else cx.requester_id end;

  return query
  select cx.id, me.full_name, me.avatar_path, me.external_avatar_url,
         o.id, o.full_name, public.age_years(o.date_of_birth), o.avatar_path, o.external_avatar_url,
         ol.area_name,
         case when ml.latitude is null or ol.latitude is null then null
              else round(public.haversine_km(ml.latitude, ml.longitude, ol.latitude, ol.longitude)::numeric, 1) end,
         public._shared_labels(v_uid, o.id),
         array(select x ->> 'label' from jsonb_array_elements(public._goal_list(o.id)) x
                where (x ->> 'key') = any (public._goal_keys(v_uid))),
         array(select unnest(me.availability) intersect select unnest(o.availability)),
         cx.activity_label,
         pc.phone, pc.instagram,
         case when pc.share_email then (select u.email::text from auth.users u where u.id = o.id) end,
         cx.responded_at
    from public.profiles me
    join public.profiles o on o.id = v_other
    left join public.user_locations ml on ml.user_id = me.id
    left join public.user_locations ol on ol.user_id = o.id
    left join public.profile_contacts pc on pc.user_id = o.id
   where me.id = v_uid;
end;
$$;

-- -----------------------------------------------------------------------------
-- Function privileges
-- -----------------------------------------------------------------------------
do $$
declare
  fn text;
begin
  foreach fn in array array[
    'public.save_activities(text[], text)',
    'public.save_goals_and_schedule(text[], text, public.fitness_level, public.availability_slot[])',
    'public.complete_onboarding()',
    'public.discover_profiles(text, public.fitness_level, public.availability_slot, numeric, int, int)',
    'public.get_profile(uuid)',
    'public.send_connection(uuid)',
    'public.respond_connection(uuid, boolean)',
    'public.cancel_connection(uuid)',
    'public.list_connections(text)',
    'public.pending_request_count()',
    'public.get_match(uuid)'
  ] loop
    execute format('revoke execute on function %s from public, anon', fn);
    execute format('grant execute on function %s to authenticated', fn);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Storage: avatars bucket (public read, owner-only write in <uid>/ folder)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "avatar owners can read their folder" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatar owners can upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatar owners can update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatar owners can delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
