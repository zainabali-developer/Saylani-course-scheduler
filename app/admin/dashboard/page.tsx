import { createClient, isAdmin } from "@/lib/supabase/server";
import AdminDashboard from "@/components/AdminDashboard";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const admin = await isAdmin();

  if (!admin) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <BackButton fallbackHref="/" />
        <h1 className="font-display font-bold text-2xl mb-2">Not an admin</h1>
        <p className="text-paper/50 text-sm">
          You&apos;re signed in, but this email isn&apos;t on the <code>admins</code> allow-list yet.
          Add it in the Supabase table editor, then reload.
        </p>
        <Link href="/admin/login" className="text-accent text-sm mt-6 inline-block">
          Back to login
        </Link>
      </div>
    );
  }

  const supabase = createClient();
  const [{ data: teachers }, { data: courses }, { data: schedule }] = await Promise.all([
    supabase.from("teachers").select("*").order("name"),
    supabase.from("courses").select("*").order("name"),
    supabase.from("schedule").select("*, courses(*), teachers(*)").order("start_time"),
  ]);

  return (
    <AdminDashboard
      initialTeachers={teachers ?? []}
      initialCourses={courses ?? []}
      initialSchedule={schedule ?? []}
    />
  );
}
