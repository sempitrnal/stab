"use client";

import { useState, useTransition } from "react";
import { signInAdmin } from "./actions";

const inputCls =
  "w-full bg-transparent border border-ink/25 px-3 py-3 font-mono text-xs tracking-widest placeholder:uppercase placeholder:text-faded focus:outline-none focus:border-ink";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      // On success the action redirects, so it only returns on failure.
      const result = await signInAdmin(username, password);
      setError(result.error);
    });
  }

  return (
    <div className="px-4 py-24 flex flex-col items-center">
      <div className="w-full max-w-xs flex flex-col gap-6">
        <h1 className="font-black uppercase tracking-tight text-3xl text-center">
          Admin
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className={inputCls}
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={inputCls}
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-ink text-paper font-mono text-xs uppercase tracking-widest py-3 hover:bg-accent transition-colors disabled:opacity-50"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
          {error && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent text-center">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
