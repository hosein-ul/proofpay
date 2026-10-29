import { Breadcrumbs } from "@/components/ui/data";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, breadcrumbs, meta, className }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; breadcrumbs?: { label: string; href?: string }[]; meta?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("mb-6 grid gap-3", className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="grid min-w-0 flex-[1_1_300px] gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] leading-[1.05] font-semibold tracking-[-0.035em] [font-variation-settings:'wdth'_114]">{title}</h1>
            {meta}
          </div>
          {description && <p className="max-w-[68ch] text-[14px] text-text-2">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function Panel({ title, description, actions, children, className, bodyClass, flush }: { title?: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; bodyClass?: string; flush?: boolean }) {
  return (
    <section className={cn("overflow-hidden rounded-panel bg-raised shadow-raised", className)}>
      {(title || actions) && (
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <div className="grid flex-1 gap-0.5">
            {title && <h2 className="text-[14px] font-semibold tracking-[-0.01em]">{title}</h2>}
            {description && <p className="text-[12.5px] text-text-3">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={cn(!flush && "px-4 pb-4", !title && !actions && !flush && "pt-4", bodyClass)}>{children}</div>
    </section>
  );
}
