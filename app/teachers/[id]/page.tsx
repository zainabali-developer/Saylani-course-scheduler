import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScheduleRow, Teacher } from "@/lib/types";
import BackButton from "@/components/BackButton";

export const revalidate = 0;

export default async function TeacherProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: teacher } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Teacher>();

  if (!teacher) notFound();

  const { data: slots } = await supabase
    .from("schedule")
    .select("*, courses(*)")
    .eq("teacher_id", params.id);

  const rows = (slots as ScheduleRow[] | null) ?? [];
  const courses = Array.from(
    new Map(rows.filter((r) => r.courses).map((r) => [r.courses!.id, r.courses!])).values()
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <BackButton label="Back to teachers" fallbackHref="/teachers" />
      <div className="flex items-center gap-4">
        {teacher.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={teacher.photo_url}
            alt={teacher.name}
            className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-full bg-white/5 border border-white/10" />
        )}
        <h1 className="font-display font-bold text-3xl sm:text-4xl">{teacher.name}</h1>
      </div>
      {teacher.bio && <p className="text-paper/60 mt-4 leading-relaxed">{teacher.bio}</p>}
      <div className="flex flex-wrap gap-4 mt-4 text-sm text-paper/50">
        {teacher.email && <span>{teacher.email}</span>}
        {teacher.phone && <span>{teacher.phone}</span>}
      </div>

      {courses.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display font-bold text-lg mb-3">Their courses</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {courses.map((c) => (
              <Link href={`/courses/${c.id}`} key={c.id} className="card overflow-hidden hover:border-white/25 transition-colors">
                {c.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.photo_url} alt={c.name} className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-t-xl" />
                )}
                <div className="p-5">
                  <span className="chip" style={{ background: c.color }}>{c.duration || "Course"}</span>
                  <p className="font-display font-bold mt-3">{c.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
