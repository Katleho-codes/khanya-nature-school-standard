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
        className={`flex flex-wrap items-center gap-1.5 text-[0.72rem] ${inverse ? "text-oat/60" : "text-bark-soft"}`}
      >
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={`transition-colors ${inverse ? "hover:text-ochre" : "hover:text-forest"}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? (inverse ? "text-oat/85" : "text-forest") : ""}>
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
