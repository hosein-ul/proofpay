import { cn } from "@/lib/utils";

export function PageHero({ eyebrow, title, lead, children }: { eyebrow?: string; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="dots pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(60%_90%_at_90%_0%,#000,transparent)]" />
      <div className="relative mx-auto grid max-w-[1200px] gap-4 px-5 py-16 md:py-20">
        {eyebrow && <p className="text-[13px] font-medium text-light-text">{eyebrow}</p>}
        <h1 className="t-display max-w-[18ch] !text-[clamp(36px,5vw,56px)]">{title}</h1>
        {lead && <p className="max-w-[62ch] text-[18px] leading-relaxed text-text-2">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

export function Section({ title, lead, children, tone, className }: { title?: string; lead?: string; children: React.ReactNode; tone?: "sunk"; className?: string }) {
  return (
    <section className={cn(tone === "sunk" && "border-y border-line bg-sunk")}>
      <div className={cn("mx-auto max-w-[1200px] px-5 py-16", className)}>
        {title && <h2 className="t-h1 mb-2">{title}</h2>}
        {lead && <p className="mb-8 max-w-[62ch] text-[16px] text-text-2">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto grid max-w-[760px] gap-4 px-5 py-14 text-[15.5px] leading-relaxed text-text-2 [&_h2]:mt-6 [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-text [&_h3]:mt-3 [&_h3]:text-[16.5px] [&_h3]:font-semibold [&_h3]:text-text [&_li]:ml-5 [&_li]:list-disc [&_a]:text-text [&_a]:underline [&_a]:underline-offset-2 [&_code]:mono [&_code]:rounded [&_code]:bg-sunk [&_code]:px-1 [&_code]:text-[13px]">{children}</div>;
}

export function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid content-start gap-2 rounded-panel bg-raised p-5 shadow-raised", className)}>
      <h3 className="text-[16px] font-semibold tracking-[-0.01em]">{title}</h3>
      <div className="text-[14.5px] text-text-2">{children}</div>
    </div>
  );
}
