import Link from "next/link";
import { ButtonLink } from "./Button";
import { Cloud, ScribbleField, ScribbleUnderline, Sun } from "./brand";
import { ArrowRightIcon } from "./icons";

export function NotFoundContent() {
  return (
    <section className="page-container section relative overflow-hidden">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="sticker bg-poppy-tint text-ink">404 · Page not found</p>
          <h1 className="display-xl mt-5 max-w-[12ch] text-ink">
            This path has{" "}
            <span className="relative inline-block">
              grown over
              <ScribbleUnderline className="absolute -bottom-2 left-0 h-3 w-full text-poppy" />
            </span>
            .
          </h1>
          <p className="lead mt-7 max-w-xl">
            The page you were looking for is not here. It may have moved, or the
            link may have been mistyped. The garden is still open, and the gate
            is just over there.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/">
              Back to the home page <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/programmes" variant="outline">
              Browse programmes
            </ButtonLink>
          </div>
          <nav aria-label="Helpful links" className="mt-10">
            <p className="font-display text-lg font-extrabold text-ink">Try one of these</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[0.9rem] font-semibold">
              {[
                { href: "/about", label: "About the school" },
                { href: "/branches", label: "Our branches" },
                { href: "/admissions", label: "Admissions and fees" },
                { href: "/news", label: "News" },
                { href: "/events", label: "Events" },
                { href: "/gallery", label: "Gallery" },
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="squiggle-link text-ink hover:text-poppy-deep">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="relative lg:col-span-4 lg:col-start-9">
          <div className="paper-card relative aspect-[4/5] overflow-hidden bg-sky-tint text-sky-deep">
            <ScribbleField className="absolute inset-0 h-full w-full opacity-40" />
            <Cloud className="absolute -left-6 top-7 h-16 w-32 text-paper opacity-80" />
            <Sun className="animate-bob absolute right-5 top-5 h-24 w-24 text-sun" />
            <div className="absolute inset-x-5 bottom-5 rounded-[26px_22px_30px_18px] bg-paper/90 p-5 paper-shadow">
              <p className="hand text-ink/60">A small detour</p>
              <p className="mt-1 font-display text-[1.4rem] font-extrabold leading-tight text-ink">
                Even the best walkers take a wrong turn.
              </p>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-ink/70">
                Use the links to find your way back to the school.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
