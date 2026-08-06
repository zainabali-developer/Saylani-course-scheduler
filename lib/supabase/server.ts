import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component — middleware refreshes the session instead
          }
        },
      },
    }
  );
}

/** True if the currently logged-in user's email is on the `admins` allow-list. */
export async function isAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return false;

  const { data } = await supabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  return Boolean(data);
}
