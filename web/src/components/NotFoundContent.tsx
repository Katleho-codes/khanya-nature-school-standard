import Link from "next/link";
import { ButtonLink } from "./Button";
import { LeafPattern } from "./brand";
import { ArrowRightIcon } from "./icons";

export function NotFoundContent() {
  return (
    <section className="page-container py-16 md:py-28">
      <div className="grid gap-10 border-t border-line pt-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="label-caps text-sage-deep">404 · Page not found</p>
          <h1 className="display-xl mt-4 max-w-[13ch] text-forest">
            This path has grown over.
          </h1>
          <p className="lead mt-6 max-w-xl">
            The page you were looking for is not here. It may have moved, or the
            link may have been mistyped. The garden is still open.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/">
              Back to the home page <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/programmes" variant="outline">
              Browse programmes
            </ButtonLink>
          </div>
          <nav aria-label="Helpful links" className="mt-10 border-t border-line pt-5">
            <p className="label-caps text-sage-deep">Try one of these</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[0.86rem]">
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
                  <Link
                    href={item.href}
                    className="text-forest transition-colors hover:text-sage-deep"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="relative lg:col-span-4 lg:col-start-9">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-sage-tint">
            <LeafPattern className="absolute -right-4 top-0 h-full w-3/4 text-sage-deep opacity-35" />
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <span className="label-caps text-sage-deep">A small detour</span>
              <div>
                <span className="mb-3 block h-0.5 w-8 bg-ochre" aria-hidden />
                <p className="font-display text-[1.35rem] leading-snug text-forest">
                  Even the best walkers take a wrong turn.
                </p>
                <p className="mt-2 text-[0.8rem] leading-relaxed text-bark-soft">
                  Use the links to find your way back to the school.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
