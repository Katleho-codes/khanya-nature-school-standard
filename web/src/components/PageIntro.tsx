import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { ScribbleField, Sun } from "./brand";

interface PageIntroProps {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: Crumb[];
  aside?: ReactNode;
  children?: ReactNode;
}

export function PageIntro({
  eyebrow,
  title,
  lead,
  crumbs,
  aside,
  children,
}: PageIntroProps) {
  return (
    <section className="page-container relative overflow-hidden pb-10 pt-6 md:pb-16 md:pt-10">
      <ScribbleField className="pointer-events-none absolute -right-20 top-0 h-72 w-72 text-sun opacity-20" />
      {crumbs ? <div className="relative mb-6"><Breadcrumbs items={crumbs} /></div> : null}
      <div className="relative grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className={aside ? "lg:col-span-7" : "lg:col-span-8"}>
          <p className="sticker bg-poppy-tint text-ink">
            <Sun className="h-4 w-4 text-poppy-deep" />
            {eyebrow}
          </p>
          <h1 className="display-lg mt-4 max-w-[16ch] text-ink">{title}</h1>
        </div>
        {lead ? (
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="lead max-w-prose">{lead}</p>
            {aside}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
