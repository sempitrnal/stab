"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Magic links always land on the production site, whichever origin the form
// was opened from. Override with NEXT_PUBLIC_SITE_URL for other deployments.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://stabhardcore.vercel.app";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${SITE_URL}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="px-4 py-24 flex flex-col items-center">
      <div className="w-full max-w-xs flex flex-col gap-6">
        <h1 className="font-black uppercase tracking-tight text-3xl text-center">
          Admin
        </h1>
        {sent ? (
          <p className="font-mono text-xs uppercase tracking-widest text-center text-faded">
            Magic link sent, check your email
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="EMAIL"
              className="w-full bg-transparent border border-ink/25 px-3 py-3 font-mono text-xs uppercase tracking-widest placeholder:text-faded focus:outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-paper font-mono text-xs uppercase tracking-widest py-3 hover:bg-accent transition-colors disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>
            {error && (
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent text-center">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
