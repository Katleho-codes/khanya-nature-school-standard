"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { adminInput, adminLabel } from "./admin-ui";

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
        <label htmlFor="login-email" className={adminLabel}>
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={adminInput}
          placeholder="you@khanyanatureschool.example"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="login-password" className={adminLabel}>
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="inline-flex min-h-11 items-center px-2 text-[0.76rem] font-bold text-sky-deep underline decoration-wavy underline-offset-4"
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
          className={adminInput}
          placeholder="Your password"
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-[16px] border-2 border-poppy-deep bg-poppy-tint px-3.5 py-2.5 text-[0.84rem] field-error text-poppy-deep"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="press inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-b-4 border-sun-deep bg-sun px-5 py-3 text-[0.92rem] font-extrabold text-ink transition-colors hover:bg-sun-deep disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-ink/25 border-t-poppy-deep"
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

      <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink/10 pt-4 text-[0.78rem]">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-bold text-ink/70 squiggle-link hover:text-poppy-deep"
        >
          Back to the website
        </Link>
        <span className="inline-flex items-center gap-1.5 font-semibold text-ink/60">
          <CheckIcon className="h-4 w-4 text-meadow-deep" />
          Secure session
        </span>
      </div>
    </form>
  );
}
