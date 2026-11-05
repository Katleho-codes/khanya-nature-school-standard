import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { Logo, LeafPattern } from "@/components/brand";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <div className="min-h-screen bg-oat lg:grid lg:grid-cols-12">
      <section className="section-forest relative overflow-hidden bg-forest px-6 py-10 text-oat sm:px-10 lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-14">
        <LeafPattern className="pointer-events-none absolute -right-20 bottom-0 h-[32rem] w-[24rem] text-oat opacity-[0.06]" />
        <div className="relative">
          <Link href="/" aria-label="Khanya Nature School home">
            <Logo inverse />
          </Link>
          <p className="mt-12 label-caps text-oat/70">Staff area</p>
          <h1 className="mt-3 max-w-md font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-[1.03] tracking-[-0.03em] text-oat">
            The school office, after hours.
          </h1>
          <p className="mt-5 max-w-sm text-[0.94rem] leading-relaxed text-oat/65">
            Manage the public website, answer enquiries and keep the calendar
            current. Everything here appears on the website as soon as you save.
          </p>
        </div>

        <div className="relative mt-12 rounded-sm border border-oat/15 bg-oat/5 p-4 lg:mt-0">
          <p className="text-[0.62rem] uppercase tracking-[0.16em] text-oat/70">
            Demo access
          </p>
          <div className="mt-2 space-y-1 text-[0.78rem] text-oat/75">
            <p>
              Administrator: <span className="text-oat">admin@khanyanatureschool.example</span>
            </p>
            <p>
              Password: <span className="text-oat">KhanyaAdmin2027!</span>
            </p>
            <p className="pt-1 text-[0.7rem] text-oat/70">
              Editor credentials are listed in the project README.
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center px-5 py-10 sm:px-10 lg:col-span-7 lg:px-16 lg:py-14">
        <div className="mx-auto w-full max-w-md">
          <p className="label-caps text-sage-deep">Sign in</p>
          <h2 className="display-md mt-2 text-forest">Welcome back.</h2>
          <p className="mt-2 text-[0.88rem] leading-relaxed text-bark-soft">
            Use your school email address and password. Sessions expire after
            seven days of inactivity.
          </p>
          <LoginForm />
          <p className="mt-8 text-[0.72rem] leading-relaxed text-bark-soft">
            Public sign up is disabled. If you need an account, ask an
            administrator.{" "}
            <Link href="/contact" className="mark-link text-forest">
              Contact the office
            </Link>
            .
          </p>
          <div className="mt-5 flex items-center gap-2 text-[0.68rem] text-bark-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" aria-hidden />
            Demo website by LSQD Studios. Khanya Nature School is a fictional school.
          </div>
        </div>
      </section>
    </div>
  );
}
