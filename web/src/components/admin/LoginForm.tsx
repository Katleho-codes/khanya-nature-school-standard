"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe: true }),
        credentials: "same-origin",
      });
      if (!response.ok) {
        let message = "That email address and password did not match.";
        try {
          const body = (await response.json()) as { message?: string };
          if (body.message) message = body.message;
        } catch {
          // Keep the default message.
        }
        setError(message);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("The sign in service could not be reached. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
      <div>
        <label
          htmlFor="login-email"
          className="block text-[0.76rem] font-medium text-forest"
        >
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1.5 w-full rounded-sm border border-line-strong bg-paper px-3.5 py-2.5 text-[0.9rem] text-bark focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15"
          placeholder="you@khanyanatureschool.example"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor="login-password"
            className="block text-[0.76rem] font-medium text-forest"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="text-[0.7rem] text-sage-deep underline underline-offset-2"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <input
          id="login-password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1.5 w-full rounded-sm border border-line-strong bg-paper px-3.5 py-2.5 text-[0.9rem] text-bark focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15"
          placeholder="Your password"
        />
      </div>

      {error ? (
        <div role="alert" className="border-l-2 border-clay bg-clay/5 px-3 py-2.5 text-[0.8rem] text-clay">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-forest bg-forest px-4 py-3 text-[0.88rem] font-medium text-oat transition-colors hover:border-forest-deep hover:bg-forest-deep disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-oat/40 border-t-oat"
              aria-hidden
            />
            Signing in
          </>
        ) : (
          <>
            Sign in to the CMS
            <ArrowRightIcon className="h-4 w-4" />
          </>
        )}
      </button>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4 text-[0.74rem]">
        <Link href="/" className="text-bark-soft transition-colors hover:text-forest">
          Back to the website
        </Link>
        <span className="inline-flex items-center gap-1.5 text-sage-deep">
          <CheckIcon className="h-3.5 w-3.5" />
          Secure session
        </span>
      </div>
    </form>
  );
}
