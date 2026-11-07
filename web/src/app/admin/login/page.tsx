import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { Logo, ScribbleField } from "@/components/brand";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-12">
      <section className="relative overflow-hidden bg-ink px-6 py-10 text-paper sm:px-10 lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-14">
        <ScribbleField className="pointer-events-none absolute -right-20 bottom-0 h-[32rem] w-[24rem] text-sun opacity-[0.16]" />
        <div className="relative">
          <Link href="/" aria-label="Khanya Nature School home" className="inline-block">
            <Logo inverse />
          </Link>
          <p className="sticker mt-12 bg-sun text-ink">Staff area</p>
          <h1 className="mt-4 max-w-md font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-[1.03] tracking-[-0.03em] text-paper">
            The school office, after hours.
          </h1>
          <p className="mt-5 max-w-sm text-[0.96rem] leading-relaxed text-paper/75">
            Manage the public website, answer enquiries and keep the calendar
            current. Everything here appears on the website as soon as you save.
          </p>
        </div>

        <div className="paper-card relative mt-12 rotate-[-1deg] border-2 border-paper/15 bg-paper/10 p-4 lg:mt-0">
          <p className="hand text-[1.25rem] text-sun">Demo access</p>
          <div className="mt-2 space-y-1 text-[0.8rem] text-paper/80">
            <p>
              Administrator:{" "}
              <span className="font-bold text-paper">admin@khanyanatureschool.example</span>
            </p>
            <p>
              Password: <span className="font-bold text-paper">KhanyaAdmin2027!</span>
            </p>
            <p className="pt-1 text-[0.74rem] text-paper/70">
              Editor credentials are listed in the project README.
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center px-5 py-10 sm:px-10 lg:col-span-7 lg:px-16 lg:py-14">
        <div className="mx-auto w-full max-w-md">
          <p className="sticker bg-sky-tint text-ink">Sign in</p>
          <h2 className="display-md mt-3 text-ink">Welcome back.</h2>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-ink/75">
            Use your school email address and password. Sessions expire after
            seven days of inactivity.
          </p>
          <LoginForm />
          <p className="mt-8 text-[0.78rem] leading-relaxed text-ink/75">
            Public sign up is disabled. If you need an account, ask an
            administrator.{" "}
            <Link
              href="/contact"
              className="font-bold text-ink squiggle-link hover:text-poppy-deep"
            >
              Contact the office
            </Link>
            .
          </p>
          <div className="mt-5 flex items-center gap-2 text-[0.72rem] text-ink/75">
            <span className="h-2 w-2 rounded-full bg-sun" aria-hidden />
            Demo website by LSQD Studios. Khanya Nature School is a fictional school.
          </div>
        </div>
      </section>
    </div>
  );
}
