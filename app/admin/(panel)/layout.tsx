import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/configured";
import { adminEmail } from "@/lib/admin-email";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) redirect("/admin/login");

  const supabase = await createClient();
  // Verified locally against the project's signing keys (no Auth round trip,
  // unlike getUser()). Writes still re-check with getUser() in actions.ts.
  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.email !== adminEmail()) redirect("/admin/login");

  return <>{children}</>;
}
