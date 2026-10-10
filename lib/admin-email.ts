// The Supabase account behind the admin login. An empty ADMIN_EMAIL counts as
// unset, so the login, the panel guard and admin actions always agree on one
// account (and never fall back to "any signed-in user").
export function adminEmail() {
  return process.env.ADMIN_EMAIL?.trim() || "admin@stab.local";
}
