import Link from "next/link";
import { ChevronRightIcon } from "./icons";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  inverse = false,
}: {
  items: Crumb[];
  inverse?: boolean;
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={`flex flex-wrap items-center gap-1.5 text-[0.78rem] font-semibold ${inverse ? "text-paper/60" : "text-ink/50"}`}
      >
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={`transition-colors ${inverse ? "hover:text-sun" : "hover:text-poppy-deep"}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? (inverse ? "text-paper/85" : "text-ink") : ""}>
                  {item.label}
                </span>
              )}
              {!last ? <ChevronRightIcon className="h-3 w-3 opacity-50" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
