-- ============================================================
-- Saylani Weekend Classes Timetable — Supabase schema
-- Run this whole file in: Supabase Dashboard -> SQL Editor -> New query
-- Safe to paste and run again any time — every statement uses
-- if not exists / on conflict do nothing / drop-then-create, so
-- re-running it on a database that already has everything is a no-op.
-- ============================================================

-- 1. TEACHERS ---------------------------------------------------
create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text default '',
  email text default '',
  phone text default '',
  created_at timestamptz default now()
);

-- 2. COURSES ------------------------------------------------------
-- `color` is a hex value used for the color-chip that matches the
-- original printed timetable (red / orange / purple / olive / green / navy)
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  fee numeric default 0,
  duration text default '',
  color text default '#6366F1',
  created_at timestamptz default now()
);

-- 3. SCHEDULE (one row per lab/day/time/batch slot) ---------------
create table if not exists schedule (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  teacher_id uuid references teachers(id) on delete set null,
  lab text not null,                 -- 'Lab-1' | 'Lab-2' | 'Lab-3'
  day_label text not null default '(Sat, Sun)',
  start_time text not null,          -- e.g. '09:00'
  end_time text not null,            -- e.g. '11:00'
  batch text default 'A',            -- 'A' | 'B'
  created_at timestamptz default now()
);

-- 4. ADMINS (email allow-list checked after Supabase Auth login) --
create table if not exists admins (
  email text primary key
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table teachers enable row level security;
alter table courses enable row level security;
alter table schedule enable row level security;
alter table admins enable row level security;

-- Public (anon) can read everything on the public site
drop policy if exists "public read teachers" on teachers;
create policy "public read teachers" on teachers for select using (true);

drop policy if exists "public read courses" on courses;
create policy "public read courses" on courses for select using (true);

drop policy if exists "public read schedule" on schedule;
create policy "public read schedule" on schedule for select using (true);

-- Only logged-in users whose email is in `admins` may write
drop policy if exists "admin write teachers" on teachers;
create policy "admin write teachers" on teachers for all
  using (auth.jwt() ->> 'email' in (select email from admins))
  with check (auth.jwt() ->> 'email' in (select email from admins));

drop policy if exists "admin write courses" on courses;
create policy "admin write courses" on courses for all
  using (auth.jwt() ->> 'email' in (select email from admins))
  with check (auth.jwt() ->> 'email' in (select email from admins));

drop policy if exists "admin write schedule" on schedule;
create policy "admin write schedule" on schedule for all
  using (auth.jwt() ->> 'email' in (select email from admins))
  with check (auth.jwt() ->> 'email' in (select email from admins));

-- A logged-in user needs to be able to check if THEY are an admin
drop policy if exists "self read admins" on admins;
create policy "self read admins" on admins for select
  using (auth.jwt() ->> 'email' = email);

-- ============================================================
-- Seed data — taken from the 2nd Week (16-17 May 26) timetable
-- ============================================================
insert into teachers (name, email, phone, bio) values
  ('Mr. Mubashir', 'mubashir@saylani.org', '', 'Instructor — Digital Marketing with AI'),
  ('Mr. Ahmed',    'ahmed@saylani.org',    '', 'Instructor — Web & App Crash Course, Freelancing & Job Hunting'),
  ('Mr. Jamal',    'jamal@saylani.org',    '', 'Instructor — AI & Coding, Generative AI & Chatbots'),
  ('Mr. Shehriyar','shehriyar@saylani.org','', 'Instructor — Emerging Technologies'),
  ('Mr. Afaq',     'afaq@saylani.org',     '', 'Instructor — AI & Coding')
on conflict do nothing;

insert into courses (name, description, fee, duration, color) values
  ('Digital Marketing with AI',   'Learn digital marketing workflows supercharged with AI tools.', 0, '2 hrs / session', '#E53E3E'),
  ('Web & App Crash Course',      'A fast-paced intro to building web and mobile apps.',            0, '2 hrs / session', '#DD6B20'),
  ('AI & Coding',                 'Hands-on coding with AI-assisted development.',                  0, '2 hrs / session', '#805AD5'),
  ('Freelancing & Job Hunting',   'How to find, win, and deliver freelance and remote work.',       0, '2 hrs / session', '#8B7A2C'),
  ('Emerging Technologies',       'A tour of the technologies shaping the next decade.',            0, '2 hrs / session', '#48BB78'),
  ('Generative AI & Chatbots',    'Build with generative AI models and conversational bots.',       0, '2 hrs / session', '#1A202C')
on conflict do nothing;

-- Schedule rows — mapped 1:1 from the printed grid
insert into schedule (course_id, teacher_id, lab, day_label, start_time, end_time, batch)
select c.id, t.id, s.lab, '(Sat, Sun)', s.start_time, s.end_time, s.batch
from (values
  ('Digital Marketing with AI', 'Mr. Mubashir', 'Lab-1', '09:00', '11:00', 'A'),
  ('Web & App Crash Course',    'Mr. Ahmed',    'Lab-2', '09:00', '11:00', 'A'),
  ('AI & Coding',                'Mr. Jamal',    'Lab-3', '09:00', '11:00', 'A'),
  ('Digital Marketing with AI', 'Mr. Mubashir', 'Lab-1', '11:00', '13:00', 'B'),
  ('Freelancing & Job Hunting', 'Mr. Ahmed',    'Lab-2', '11:00', '13:00', 'A'),
  ('Emerging Technologies',      'Mr. Shehriyar','Lab-3', '11:00', '13:00', 'A'),
  ('AI & Coding',                'Mr. Afaq',     'Lab-1', '13:00', '15:00', 'B'),
  ('Generative AI & Chatbots',  'Mr. Jamal',    'Lab-2', '13:00', '15:00', 'A'),
  ('Emerging Technologies',      'Mr. Shehriyar','Lab-3', '13:00', '15:00', 'B')
) as s(course_name, teacher_name, lab, start_time, end_time, batch)
join courses c on c.name = s.course_name
join teachers t on t.name = s.teacher_name;

-- ============================================================
-- IMPORTANT: after creating your admin user in
-- Authentication -> Users, add their email here so they can
-- log in to /admin/login and pass the is_admin check:
--
-- insert into admins (email) values ('you@example.com');
-- ============================================================


-- ============================================================
-- Photos — teacher & course profile pictures
-- Safe to run again on a database that already has the tables
-- above (uses `if not exists` / `on conflict do nothing`).
-- ============================================================

alter table teachers add column if not exists photo_url text default '';
alter table courses add column if not exists photo_url text default '';

-- One public storage bucket, split into teachers/ and courses/ folders
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- RLS is already enabled on storage.objects by default on every Supabase
-- project — you can't ALTER it yourself (it's owned by an internal role),
-- and you don't need to. Just add the policies:
drop policy if exists "public read photos" on storage.objects;
create policy "public read photos" on storage.objects for select
  using (bucket_id = 'photos');

-- Only allow-listed admins can upload / replace / remove photos
drop policy if exists "admin upload photos" on storage.objects;
create policy "admin upload photos" on storage.objects for insert
  with check (bucket_id = 'photos' and auth.jwt() ->> 'email' in (select email from admins));

drop policy if exists "admin update photos" on storage.objects;
create policy "admin update photos" on storage.objects for update
  using (bucket_id = 'photos' and auth.jwt() ->> 'email' in (select email from admins));

drop policy if exists "admin delete photos" on storage.objects;
create policy "admin delete photos" on storage.objects for delete
  using (bucket_id = 'photos' and auth.jwt() ->> 'email' in (select email from admins));
