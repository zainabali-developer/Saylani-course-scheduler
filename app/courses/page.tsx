import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Course, ScheduleRow } from "@/lib/types";
import BackButton from "@/components/BackButton";

export const revalidate = 0;

type CourseWithSlots = Course & { schedule: ScheduleRow[] };

export default async function CoursesPage() {
  const supabase = createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*, schedule(*)")
    .order("name", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <BackButton fallbackHref="/" />
      <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2">All courses</h1>
      <p className="text-paper/50 mb-8 sm:mb-10">Description, fee, duration, and lab timing for every course this week.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(courses as CourseWithSlots[] | null)?.map((c) => {
          const slots = [...(c.schedule ?? [])].sort((a, b) => a.start_time.localeCompare(b.start_time));
          return (
            <Link href={`/courses/${c.id}`} key={c.id} className="card overflow-hidden hover:border-white/25 transition-colors">
              {c.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.photo_url} alt={c.name} className="w-full h-40 sm:h-48 object-cover" />
              )}
              <div className="p-5">
                <span className="chip" style={{ background: c.color }}>{c.duration || "Course"}</span>
                <h3 className="font-display font-bold text-lg mt-3">{c.name}</h3>
                <p className="text-paper/50 text-sm mt-2 line-clamp-3">{c.description}</p>
                <p className="text-paper/70 text-sm mt-3 font-medium">
                  {c.fee > 0 ? `Rs. ${c.fee}` : "Free"}
                </p>
                {slots.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                    {slots.map((s) => (
                      <p key={s.id} className="text-paper/50 text-xs">
                        {s.lab} · {s.start_time}–{s.end_time} · Sat/Sun
                        {slots.length > 1 && <span className="text-paper/30"> (Batch {s.batch})</span>}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
        {!courses?.length && <p className="text-paper/40 text-sm">No courses yet.</p>}
      </div>
    </div>
  );
}
