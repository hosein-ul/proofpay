import type { Metadata } from "next";
import { Mark, Logo } from "@/components/brand/mark";
import { PlateStack } from "@/components/brand/plate-stack";
import { SiteFooter, SiteHeader } from "@/components/site/chrome";
import { Button } from "@/components/ui/button";
import { Chip, ModeBadge, SimTag, StatusChip } from "@/components/ui/chips";
import { Callout } from "@/components/ui/feedback";
import { BrandMark, MarksCaption, TokenOnChain } from "@/components/ui/marks";
import { TASK_STATES } from "@/lib/domain/types";

export const metadata: Metadata = { title: "Design system", robots: { index: false } };

const SURFACES = ["ground", "raised", "sunk", "lift"] as const;
const SEMANTIC = ["ok", "warn", "bad", "info", "light"] as const;
const TYPE = [
  ["t-display", "Pay when it’s proven."],
  ["t-h1", "Heading one"],
  ["t-h2", "Heading two"],
  ["t-h3", "Heading three"],
  ["t-lg", "Large body text for leads and intros."],
  ["", "Body text. The product is built on one sans with tabular numerals."],
  ["t-small", "Small text for hints and captions."],
] as const;

export default function Design() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto grid max-w-[1200px] gap-14 px-5 py-14">
        <header className="grid gap-3">
          <p className="text-[13px] font-medium text-light-text">Design system</p>
          <h1 className="t-display !text-[clamp(34px,5vw,52px)]">Descent</h1>
          <p className="max-w-[62ch] text-[17px] text-text-2">One signature device, a beam of light passing down through plates, a light-first palette with a dark theme of equal standing, and amber used on at most three things per screen.</p>
        </header>

        <Block title="Surfaces">
          <div className="grid gap-3 sm:grid-cols-4">
            {SURFACES.map((s) => (
              <div key={s} className="grid gap-1 rounded-panel p-4 shadow-rest" style={{ background: `var(--${s})` }}>
                <span className="text-[14px] font-semibold">{s}</span>
                <span className="mono text-[12px] text-text-2">var(--{s})</span>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Meaning">
          <div className="grid gap-3 sm:grid-cols-5">
            {SEMANTIC.map((s) => (
              <div key={s} className="grid gap-2 rounded-panel bg-raised p-4 shadow-rest">
                <span className="h-8 rounded-control" style={{ background: `var(--${s})` }} />
                <span className="text-[13px] font-medium">{s}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-text-2">Text tokens meet WCAG AA on every surface, in both themes. Checked by axe in CI (e2e/a11y.spec.ts).</p>
        </Block>

        <Block title="Type">
          <div className="grid gap-3 rounded-stage bg-raised p-6 shadow-raised">
            {TYPE.map(([cls, text]) => (
              <div key={text} className="flex items-baseline gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                <code className="mono w-24 shrink-0 text-[11.5px] text-text-3">{cls || "body"}</code>
                <p className={cls}>{text}</p>
              </div>
            ))}
            <p className="num text-[22px] font-semibold">2,500.00 <span className="mono text-[13px] font-normal text-text-2">0x9f3a…c21e</span></p>
            <p className="text-[12.5px] text-text-3">Archivo (variable width) for everything, JetBrains Mono only for hashes and code. Amounts use tabular numerals.</p>
          </div>
        </Block>

        <Block title="Buttons and chips">
          <div className="flex flex-wrap items-center gap-3 rounded-stage bg-raised p-6 shadow-raised">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-stage bg-raised p-6 shadow-raised">
            {TASK_STATES.map((s) => <StatusChip key={s} state={s} />)}
            <Chip tone="ok">Verified</Chip>
            <ModeBadge mode="simulation" />
            <ModeBadge mode="live" />
            <SimTag label="Simulated proof" />
          </div>
        </Block>

        <Block title="Feedback">
          <div className="grid gap-3 md:grid-cols-2">
            <Callout tone="info" title="Info">Neutral guidance in one sentence.</Callout>
            <Callout tone="sim" title="Simulation">Anything synthetic is labelled like this.</Callout>
            <Callout tone="warn" title="Warning">Something needs attention before it can continue.</Callout>
            <Callout tone="bad" title="Error">What failed, and the next step.</Callout>
          </div>
        </Block>

        <Block title="Brand">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="grid place-items-center gap-4 rounded-stage bg-raised p-8 shadow-raised"><Mark size={72} title="Mark" /><Logo /></div>
            <div className="grid place-items-center rounded-stage bg-raised p-8 shadow-raised"><PlateStack count={4} lit={3} size={170} /></div>
            <div className="grid content-center gap-3 rounded-stage bg-raised p-8 shadow-raised">
              <TokenOnChain size={28} />
              <div className="flex gap-3">{(["github", "stripe", "shopify", "datadog", "hubspot"] as const).map((id) => <BrandMark key={id} id={id} size={22} />)}</div>
              <MarksCaption className="max-w-[260px]" />
            </div>
          </div>
        </Block>

        <Block title="Motion">
          <ul className="grid max-w-[70ch] gap-1.5 text-[14.5px] text-text-2 [&_li]:ml-5 [&_li]:list-disc">
            <li>Durations 90 / 160 / 240 / 400 / 700 ms, one ease-out curve, <code className="mono text-[12.5px]">cubic-bezier(.16,1,.3,1)</code>.</li>
            <li>Motion explains cause and effect: a check resolving, a plate lighting. It is never ambient.</li>
            <li><code className="mono text-[12.5px]">prefers-reduced-motion</code> removes transforms and keeps state changes.</li>
          </ul>
        </Block>
      </main>
      <SiteFooter />
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <h2 className="t-h2">{title}</h2>
      {children}
    </section>
  );
}
