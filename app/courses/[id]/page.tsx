import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Course, ScheduleRow, Teacher } from "@/lib/types";
import BackButton from "@/components/BackButton";

export const revalidate = 0;

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Course>();

  if (!course) notFound();

  const { data: slots } = await supabase
    .from("schedule")
    .select("*, teachers(*)")
    .eq("course_id", params.id)
    .order("start_time", { ascending: true });

  const rows = (slots as ScheduleRow[] | null) ?? [];
  const teachers = Array.from(
    new Map(rows.filter((r) => r.teachers).map((r) => [r.teachers!.id, r.teachers as Teacher])).values()
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <BackButton label="Back to courses" fallbackHref="/courses" />
      {course.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={course.photo_url} alt={course.name} className="w-full h-56 sm:h-72 md:h-96 object-cover rounded-xl mb-6" />
      )}
      <span className="chip" style={{ background: course.color }}>{course.duration || "Course"}</span>
      <h1 className="font-display font-bold text-4xl mt-4">{course.name}</h1>
      <p className="text-paper/60 mt-4 leading-relaxed">{course.description}</p>
      <p className="text-paper/80 font-medium mt-4">
        {course.fee > 0 ? `Rs. ${course.fee}` : "Free"}
      </p>

      {rows.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display font-bold text-lg mb-3">Slots</h2>
          <div className="card divide-y divide-white/10">
            {rows.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between text-sm">
                <span className="text-paper/70">{r.day_label} · {r.start_time}–{r.end_time}</span>
                <span className="text-paper/50">{r.lab} · Batch {r.batch}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {teachers.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display font-bold text-lg mb-3">Assigned teacher{teachers.length > 1 ? "s" : ""}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {teachers.map((t) => (
              <Link href={`/teachers/${t.id}`} key={t.id} className="card p-5 hover:border-white/25 transition-colors flex items-center gap-3">
                {t.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo_url} alt={t.name} className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover border border-white/10 shrink-0" />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 shrink-0" />
                )}
                <div>
                  <p className="font-display font-bold">{t.name}</p>
                  {t.email && <p className="text-paper/50 text-sm mt-0.5">{t.email}</p>}
                  {t.phone && <p className="text-paper/50 text-sm">{t.phone}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
