import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ScheduleRow } from "@/lib/types";
import BackButton from "@/components/BackButton";

export const revalidate = 0;

const LABS = ["Lab-1", "Lab-2", "Lab-3"];

export default async function TimetablePage() {
  const supabase = createClient();
  const { data: slots } = await supabase
    .from("schedule")
    .select("*, courses(*), teachers(*)")
    .order("start_time", { ascending: true });

  const rows = (slots as ScheduleRow[] | null) ?? [];

  // group by time range -> lab
  const timeRanges = Array.from(
    new Set(rows.map((r) => `${r.start_time}|${r.end_time}|${r.day_label}`))
  ).sort();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <BackButton fallbackHref="/" />
      <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2">Weekend schedule grid</h1>
      <p className="text-paper/50 mb-2 sm:mb-4">Tap any slot to see the full course and teacher details.</p>
      <p className="text-paper/30 text-xs mb-6 sm:mb-10 sm:hidden">Swipe sideways to see all three labs →</p>

      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[720px] card overflow-hidden">
          <div className="grid grid-cols-4 bg-white/5 text-xs uppercase tracking-wide text-paper/50 font-display font-bold">
            <div className="p-4">Day &amp; time</div>
            {LABS.map((lab) => (
              <div key={lab} className="p-4">{lab}</div>
            ))}
          </div>

          {timeRanges.map((key) => {
            const [start, end, day] = key.split("|");
            return (
              <div key={key} className="grid grid-cols-4 border-t border-white/10">
                <div className="p-4 text-sm text-paper/70">
                  <div className="font-medium">{day}</div>
                  <div className="text-paper/40">{start}–{end}</div>
                </div>
                {LABS.map((lab) => {
                  const slot = rows.find(
                    (r) => r.start_time === start && r.end_time === end && r.day_label === day && r.lab === lab
                  );
                  return (
                    <div key={lab} className="p-3">
                      {slot?.courses ? (
                        <Link
                          href={`/courses/${slot.courses.id}`}
                          className="block rounded-lg p-3 h-full hover:brightness-110 transition"
                          style={{ background: slot.courses.color }}
                        >
                          <p className="text-ink font-display font-bold text-sm leading-snug">
                            {slot.courses.name} ({slot.batch})
                          </p>
                          <p className="text-ink/70 text-xs mt-1">{slot.teachers?.name}</p>
                        </Link>
                      ) : (
                        <div className="rounded-lg p-3 h-full border border-dashed border-white/10 text-paper/20 text-xs">
                          —
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {!timeRanges.length && (
            <p className="p-8 text-paper/40 text-sm">No schedule yet — add slots from the admin dashboard.</p>
          )}
        </div>
      </div>
    </div>
  );
}
