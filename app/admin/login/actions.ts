"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function matches(a: string, b: string) {
  const hash = (v: string) => createHash("sha256").update(v).digest();
  return timingSafeEqual(hash(a), hash(b));
}

// TEMPORARY: hardcoded fallback credentials, used until ADMIN_USERNAME and
// ADMIN_PASSWORD are set in the environment (which then take over). Remove
// these and rotate the password once env vars can be configured.
const FALLBACK_USERNAME = "stabulok";
const FALLBACK_PASSWORD = "saggin123";

// Username + password login. A match signs in the
// Supabase admin account behind the scenes so the rest of admin (RLS, image
// uploads, requireAdmin) keeps working off one real session.
export async function signInAdmin(
  username: string,
  password: string,
): Promise<{ error: string }> {
  const expectedUser = process.env.ADMIN_USERNAME ?? FALLBACK_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD ?? FALLBACK_PASSWORD;
  if (
    !expectedUser ||
    !expectedPass ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return { error: "Admin login is not configured" };
  }
  const userOk = matches(username, expectedUser);
  const passOk = matches(password, expectedPass);
  if (!userOk || !passOk) return { error: "Wrong username or password" };

  const email = process.env.ADMIN_EMAIL ?? "admin@stab.local";
  const supabase = await createClient();

  let { error } = await supabase.auth.signInWithPassword({
    email,
    password: expectedPass,
  });

  if (error) {
    // First login, or the password changed: create the account or sync its
    // password, then sign in again.
    const admin = createAdminClient();
    const created = await admin.auth.admin.createUser({
      email,
      password: expectedPass,
      email_confirm: true,
    });
    if (created.error) {
      const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const existing = data?.users.find((u) => u.email === email);
      if (!existing) return { error: "Could not set up the admin account" };
      const updated = await admin.auth.admin.updateUserById(existing.id, {
        password: expectedPass,
        email_confirm: true,
      });
      if (updated.error) return { error: "Could not set up the admin account" };
    }
    ({ error } = await supabase.auth.signInWithPassword({
      email,
      password: expectedPass,
    }));
    if (error) return { error: "Sign in failed, try again" };
  }

  redirect("/admin");
}
