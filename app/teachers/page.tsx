import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Teacher } from "@/lib/types";
import BackButton from "@/components/BackButton";

export const revalidate = 0;

export default async function TeachersPage() {
  const supabase = createClient();
  const { data: teachers } = await supabase
    .from("teachers")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <BackButton fallbackHref="/" />
      <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2">Teachers</h1>
      <p className="text-paper/50 mb-8 sm:mb-10">Bio, email, phone, and the courses each teacher runs.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(teachers as Teacher[] | null)?.map((t) => (
          <Link href={`/teachers/${t.id}`} key={t.id} className="card p-5 hover:border-white/25 transition-colors">
            <div className="flex items-center gap-3">
              {t.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.photo_url} alt={t.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-white/10 shrink-0" />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 border border-white/10 shrink-0" />
              )}
              <h3 className="font-display font-bold text-lg">{t.name}</h3>
            </div>
            <p className="text-paper/50 text-sm mt-3 line-clamp-2">{t.bio}</p>
          </Link>
        ))}
        {!teachers?.length && <p className="text-paper/40 text-sm">No teachers yet.</p>}
      </div>
    </div>
  );
}
