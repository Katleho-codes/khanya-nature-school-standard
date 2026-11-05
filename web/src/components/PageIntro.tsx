import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

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
    <section className="page-container pb-10 pt-8 md:pb-16 md:pt-12">
      {crumbs ? <div className="mb-8"><Breadcrumbs items={crumbs} /></div> : null}
      <div className="rule pt-8 md:pt-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className={aside ? "lg:col-span-7" : "lg:col-span-9"}>
            <p className="label-caps text-sage-deep">{eyebrow}</p>
            <h1 className="display-lg mt-4 max-w-3xl text-forest">{title}</h1>
          </div>
          {lead ? (
            <div className={`lg:col-span-4 ${aside ? "lg:col-start-9" : "lg:col-start-9"}`}>
              <p className="lead max-w-prose">{lead}</p>
              {aside}
            </div>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
