-- Run this entire script in Supabase Dashboard > SQL Editor.
create table if not exists public.game_submissions (
  id bigint generated always as identity primary key,
  submitted_at timestamptz not null default now(),
  answers jsonb not null
);

alter table public.game_submissions enable row level security;

-- Public visitors can submit completed answers but cannot read them.
drop policy if exists "Anyone can submit answers" on public.game_submissions;
create policy "Anyone can submit answers"
on public.game_submissions for insert
to anon, authenticated
with check (jsonb_typeof(answers) = 'object');

-- Only signed-in dashboard users can read submitted answers.
drop policy if exists "Signed-in admin can read answers" on public.game_submissions;
create policy "Signed-in admin can read answers"
on public.game_submissions for select
to authenticated
using (true);

-- No public update/delete policy is created.
