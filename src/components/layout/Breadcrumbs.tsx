import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center text-xs text-slate-500 dark:text-slate-400", className)}>
      <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center">
        <Home className="w-3.5 h-3.5 mr-1" />
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3 h-3 mx-1 text-slate-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-slate-800 dark:hover:text-slate-200">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
