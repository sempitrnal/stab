"use client";

import { useState, useTransition } from "react";
import { signInAdmin } from "./actions";

const inputCls = "mac-input h-9!";

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
    <div className="px-4 py-20 flex flex-col items-center">
      <div className="mac-card w-full max-w-xs p-6 flex flex-col gap-5">
        <div className="text-center">
          <h1 className="text-[17px] font-semibold">Admin</h1>
          <p className="mt-0.5 text-[12px] text-faded">Sign in to manage the store</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
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
          <button type="submit" disabled={pending} className="btn-primary mt-1.5 h-9! w-full">
            {pending ? "Signing in…" : "Sign in"}
          </button>
          {error && (
            <p className="text-center text-[12px] text-[#d70015]">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
