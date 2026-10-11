import React from "react";
import { Breadcrumbs, BreadcrumbItem } from "./Breadcrumbs";
import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2 pb-5 border-b border-slate-200/80 dark:border-slate-800", className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-2" />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
