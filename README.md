# Saylani Weekend Classes — Timetable Site

Next.js (App Router) + Supabase. Public site: Home, Courses, Timetable, Teachers.
Admin: login + dashboard (Teachers / Courses / Schedule tabs).

## 1. Install

```bash
npm install
```

## 2. Set up the database

1. Open your Supabase project → **SQL Editor** → New query.
2. Paste the contents of `supabase/schema.sql` and run it.
   This creates the tables, RLS policies, and seeds the courses/teachers/schedule
   from the printed timetable (2nd Week, 16–17 May 26).

## 3. Photos

`schema.sql` also creates a public Storage bucket called `photos` (with `teachers/`
and `courses/` folders) and locks writes to allow-listed admins, same as the tables.
If you already ran an earlier version of this file, just re-run the whole thing —
every statement in the "Photos" section at the bottom uses `if not exists` /
`on conflict do nothing`, so it's safe to run again.

In the admin dashboard, both the Teachers and Courses forms now have a photo
uploader — pick an image and it uploads immediately; the record is saved with
that image's public URL.

## 4. Create your admin login

1. Supabase Dashboard → **Authentication → Users → Add user** (email + password).
2. Back in the **SQL Editor**, run:
   ```sql
   insert into admins (email) values ('you@example.com');
   ```
   (use the same email you just created). This is what the `is_admin` check
   in the flow diagram is checking against.

## 5. Environment variables

`.env.local` is already filled in with the project URL and anon (publishable) key
you gave me. If you rotate keys later, update it there.

## 6. Run it

```bash
npm run dev
```

- `/` — home, links to courses / timetable / teachers
- `/courses`, `/courses/[id]` — course list + detail (description, fee, duration, assigned teacher)
- `/teachers`, `/teachers/[id]` — teacher list + profile (bio, email, phone, their courses)
- `/timetable` — the weekend grid (Lab-1/2/3 × time slots), colour-coded like the original sheet
- `/admin/login` → `/admin/dashboard` — Teachers / Courses / Schedule tabs; every save calls
  `router.refresh()` so the public pages reflect the change immediately (they're server-rendered
  with `revalidate = 0`, so there's no caching to fight).

## Notes on the data model

- `courses` holds the course-level info (name, description, fee, duration, chip color).
- `teachers` holds contact info + bio.
- `schedule` is the join table: one row per (course, teacher, lab, day, time, batch) —
  this is what actually drives the `/timetable` grid, and what the **Schedule** admin
  tab edits. Assigning a teacher to a course happens here rather than on the course
  record itself, since a course can run more than once with different teachers/batches
  (e.g. AI & Coding batch A with Mr. Jamal, batch B with Mr. Afaq — exactly like the
  original sheet).
- Deleting a course cascades and removes its schedule rows (`on delete cascade`).

## Security

The anon/publishable key is safe to expose in the frontend — it can only do what the
RLS policies in `schema.sql` allow: anyone can **read**, only a signed-in user whose
email is in the `admins` table can **write**. The middleware additionally redirects
signed-out visitors away from `/admin/dashboard`.
