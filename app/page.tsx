import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Course } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <section className="pt-14 sm:pt-20 pb-12 sm:pb-16 border-b border-white/10">
        <p className="font-display text-accent text-sm mb-4">(Sat, Sun) · 0900–1500</p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.08] max-w-3xl">
          Weekend classes,
          <br />
          laid out like a timetable.
        </h1>
        <p className="text-paper/60 mt-6 max-w-lg text-base sm:text-lg">
          Browse this week&apos;s courses, see who&apos;s teaching, and check exactly
          which lab you&apos;re in and when.
        </p>
        <div className="flex flex-wrap gap-3 sm:gap-4 mt-8 sm:mt-10">
          <Link href="/timetable" className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-accent text-ink font-display font-bold text-sm hover:brightness-110 transition">
            View the timetable
          </Link>
          <Link href="/courses" className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/20 font-display font-bold text-sm hover:bg-white/5 transition">
            Browse courses
          </Link>
          <Link href="/teachers" className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/20 font-display font-bold text-sm hover:bg-white/5 transition">
            Meet the teachers
          </Link>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <h2 className="font-display font-bold text-xl sm:text-2xl mb-6 sm:mb-8">This week&apos;s courses</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(courses as Course[] | null)?.map((c) => (
            <Link
              href={`/courses/${c.id}`}
              key={c.id}
              className="card overflow-hidden hover:border-white/25 transition-colors"
            >
              {c.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.photo_url} alt={c.name} className="w-full h-32 object-cover" />
              )}
              <div className="p-5">
                <span className="chip" style={{ background: c.color }}>
                  {c.duration || "Course"}
                </span>
                <h3 className="font-display font-bold text-lg mt-3">{c.name}</h3>
                <p className="text-paper/50 text-sm mt-2 line-clamp-2">{c.description}</p>
              </div>
            </Link>
          ))}
          {!courses?.length && (
            <p className="text-paper/40 text-sm">
              No courses yet — add some from the admin dashboard.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
