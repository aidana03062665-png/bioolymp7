-- BioOlymp 7 V4 — Arena / 1 vs 1 / synced achievements
-- Run ONCE in Supabase SQL Editor after the previous BioOlymp FINAL schema.

create table if not exists public.duels (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references public.profiles(id) on delete cascade,
  opponent_id uuid not null references public.profiles(id) on delete cascade,
  question_seed text not null,
  question_count integer not null default 10 check(question_count between 5 and 50),
  status text not null default 'pending' check(status in ('pending','active','completed','cancelled')),
  challenger_score integer check(challenger_score between 0 and 100),
  opponent_score integer check(opponent_score between 0 and 100),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  completed_at timestamptz,
  check(challenger_id <> opponent_id)
);

create table if not exists public.student_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_key text not null,
  unlocked_at timestamptz not null default now(),
  primary key(user_id,achievement_key)
);

alter table public.duels enable row level security;
alter table public.student_achievements enable row level security;

revoke all on public.duels,public.student_achievements from anon,authenticated;
grant select,insert on public.duels to authenticated;
grant select,insert on public.student_achievements to authenticated;

drop policy if exists duels_select_own on public.duels;
drop policy if exists duels_insert_self on public.duels;
drop policy if exists achievements_select on public.student_achievements;
drop policy if exists achievements_insert on public.student_achievements;

create policy duels_select_own on public.duels for select to authenticated
using(auth.uid()=challenger_id or auth.uid()=opponent_id or public.is_teacher());

create policy duels_insert_self on public.duels for insert to authenticated
with check(auth.uid()=challenger_id and challenger_id<>opponent_id);

create policy achievements_select on public.student_achievements for select to authenticated
using(user_id=auth.uid() or public.is_teacher());
create policy achievements_insert on public.student_achievements for insert to authenticated
with check(user_id=auth.uid());

create or replace function public.accept_duel(p_duel_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare d public.duels%rowtype;
begin
  select * into d from public.duels where id=p_duel_id for update;
  if not found then raise exception 'Duel not found'; end if;
  if auth.uid()<>d.opponent_id then raise exception 'Only opponent can accept'; end if;
  if d.status<>'pending' then raise exception 'Duel is not pending'; end if;
  update public.duels set status='active',accepted_at=now() where id=p_duel_id;
end;$$;

create or replace function public.submit_duel_score(p_duel_id uuid,p_score integer)
returns void language plpgsql security definer set search_path=public as $$
declare d public.duels%rowtype;
begin
  if p_score < 0 or p_score > 100 then raise exception 'Invalid score'; end if;
  select * into d from public.duels where id=p_duel_id for update;
  if not found then raise exception 'Duel not found'; end if;
  if d.status not in ('active','completed') then raise exception 'Duel is not active'; end if;
  if auth.uid()=d.challenger_id then
    update public.duels set challenger_score=p_score where id=p_duel_id;
  elsif auth.uid()=d.opponent_id then
    update public.duels set opponent_score=p_score where id=p_duel_id;
  else
    raise exception 'Not a duel participant';
  end if;
  update public.duels set status='completed',completed_at=coalesce(completed_at,now())
  where id=p_duel_id and challenger_score is not null and opponent_score is not null;
end;$$;

grant execute on function public.accept_duel(uuid) to authenticated;
grant execute on function public.submit_duel_score(uuid,integer) to authenticated;
create index if not exists duels_challenger_idx on public.duels(challenger_id,created_at desc);
create index if not exists duels_opponent_idx on public.duels(opponent_id,created_at desc);

-- V4 XP bonuses: Olympiad +10, Daily +5, 1vs1 +8.
create or replace function public.update_weekly_leaderboard()
returns trigger language plpgsql security definer set search_path=public as $$
declare p public.profiles%rowtype; w date; bonus integer;
begin
  select * into p from public.profiles where id=new.user_id;
  w := date_trunc('week',new.created_at)::date;
  bonus := case new.test_type when 'olympiad' then 10 when 'daily' then 5 when 'duel' then 8 else 0 end;
  insert into public.weekly_leaderboard(user_id,week_start,display_name,class_name,attempts,best_score,total_score,xp,progress_points,updated_at)
  values(new.user_id,w,coalesce(p.full_name,p.username),p.class_name,1,new.score,new.score,round(new.score/5.0)::int+bonus,0,now())
  on conflict(user_id,week_start) do update set
    display_name=excluded.display_name, class_name=excluded.class_name,
    attempts=public.weekly_leaderboard.attempts+1,
    best_score=greatest(public.weekly_leaderboard.best_score,excluded.best_score),
    total_score=public.weekly_leaderboard.total_score+excluded.total_score,
    xp=public.weekly_leaderboard.xp+excluded.xp,
    progress_points=public.weekly_leaderboard.progress_points+greatest(excluded.best_score-public.weekly_leaderboard.best_score,0),
    updated_at=now();
  return new;
end;$$;
