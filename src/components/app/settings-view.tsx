"use client";

import { useMutation } from "@tanstack/react-query";
import { KeyRound, Webhook } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Chip, ModeBadge } from "@/components/ui/chips";
import { Time } from "@/components/ui/copy";
import { Segmented } from "@/components/ui/form";
import { useTheme } from "@/components/theme";
import type { Mode } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { TrustModel } from "./trust-model";

interface Props {
  mode: Mode;
  liveConfigured: boolean;
  members: { id: string; name: string; email: string; role: string; lastActive: string | null }[];
  keys: { id: string; name: string; prefix: string; scope: string; createdAt: string; lastUsed: string | null }[];
  webhooks: { id: string; url: string; events: string[]; active: boolean }[];
  deliveries: { id: string; webhookId: string; event: string; status: number; durationMs: number; at: string }[];
}

const SECTIONS = [
  ["environment", "Environment"],
  ["appearance", "Appearance"],
  ["members", "Members"],
  ["api-keys", "API keys"],
  ["webhooks", "Webhooks"],
  ["trust-model", "Trust Model"],
] as const;

export function SettingsView({ mode, liveConfigured, members, keys, webhooks, deliveries }: Props) {
  const router = useRouter();
  const { theme, setTheme, density, setDensity } = useTheme();

  const setMode = useMutation({
    mutationFn: async (m: Mode) => {
      const r = await fetch("/api/mode", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: m }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message ?? "Couldn’t switch mode");
    },
    onSuccess: () => router.refresh(),
    onError: (e: Error) => toast.error("Mode not changed", { description: e.message }),
  });
  const reset = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/demo/reset", { method: "POST" });
      if (!r.ok) throw new Error("Reset failed");
    },
    onSuccess: () => { toast.success("Demo data reset"); router.refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
      <nav aria-label="Settings sections" className="hidden lg:block">
        <ul className="sticky top-20 grid gap-0.5 text-[13.5px]">
          {SECTIONS.map(([id, label]) => (
            <li key={id}><a href={`#${id}`} className="block rounded-control px-3 py-1.5 text-text-2 hover:bg-sunk hover:text-text">{label}</a></li>
          ))}
        </ul>
      </nav>

      <div className="grid min-w-0 gap-6">
        <Panel id="environment" title="Environment" desc="Simulation runs real signature checks with a local test attestor. Live uses Primus on Base Sepolia.">
          <div className="flex flex-wrap items-center gap-3">
            <ModeBadge mode={mode} />
            <Segmented aria-label="Mode" value={mode} onValueChange={(v) => setMode.mutate(v as Mode)} options={[{ value: "simulation", label: "Simulation" }, { value: "live", label: "Live (testnet)" }]} />
          </div>
          {!liveConfigured && <p className="mt-3 text-[13px] text-text-2">Live needs <code className="mono text-[12px]">PRIMUS_APP_ID</code> and <code className="mono text-[12px]">PRIMUS_APP_SECRET</code>, <code className="mono text-[12px]">PRIMUS_TEMPLATE_ID</code> and <code className="mono text-[12px]">PRIMUS_ATTESTORS</code> set on the server. They are never sent to the browser.</p>}
          <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
            <Button variant="secondary" size="sm" loading={reset.isPending} onClick={() => reset.mutate()}>Reset demo data</Button>
            <span className="text-[12.5px] text-text-3">Restores the seeded workspace. Simulation only.</span>
          </div>
        </Panel>

        <Panel id="appearance" title="Appearance" desc="Stored in this browser only.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Row label="Theme"><Segmented aria-label="Theme" value={theme} onValueChange={(v) => setTheme(v as typeof theme)} options={[{ value: "system", label: "System" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} /></Row>
            <Row label="Density"><Segmented aria-label="Density" value={density} onValueChange={(v) => setDensity(v as typeof density)} options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }]} /></Row>
          </div>
        </Panel>

        <Panel id="members" title="Members" desc="Demo members. Roles decide who can create, fund and resolve.">
          <ul className="divide-y divide-line">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 py-2.5 text-[13.5px]">
                <span className="min-w-[140px] font-medium">{m.name}</span>
                <span className="flex-1 text-text-2">{m.email}</span>
                <Chip tone="mute">{m.role}</Chip>
                <span className="w-[110px] text-right text-text-3">{m.lastActive ? <Time value={m.lastActive} /> : "Never"}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel id="api-keys" title="API keys" desc="Keys are shown once on creation. Only the prefix is stored here.">
          <ul className="divide-y divide-line">
            {keys.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center gap-3 py-2.5 text-[13.5px]">
                <KeyRound className="size-4 text-text-3" />
                <span className="min-w-[140px] font-medium">{k.name}</span>
                <span className="mono flex-1 text-[12.5px] text-text-2">{k.prefix}••••••••••••</span>
                <Chip tone="mute">{k.scope}</Chip>
                <span className="w-[110px] text-right text-text-3">{k.lastUsed ? <Time value={k.lastUsed} /> : "Unused"}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12.5px] text-text-3">Demo keys only. Creating and rotating keys needs a real account system, which the beta does not have.</p>
        </Panel>

        <Panel id="webhooks" title="Webhooks" desc="Events are POSTed to your URL when a task changes state.">
          <ul className="grid gap-3">
            {webhooks.map((w) => (
              <li key={w.id} className="rounded-panel bg-sunk p-3.5">
                <div className="flex flex-wrap items-center gap-2 text-[13.5px]"><Webhook className="size-4 text-text-3" /><span className="mono text-[12.5px]">{w.url}</span><Chip tone={w.active ? "ok" : "mute"}>{w.active ? "Active" : "Paused"}</Chip></div>
                <p className="mt-1.5 text-[12.5px] text-text-3">{w.events.join(" · ")}</p>
              </li>
            ))}
          </ul>
          <h3 className="mb-1 mt-5 text-[13px] font-semibold">Recent deliveries</h3>
          <ul className="divide-y divide-line text-[13px]">
            {deliveries.slice(0, 8).map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-2">
                <span className={cn("num w-10 font-medium", d.status < 300 ? "text-ok" : "text-bad")}>{d.status}</span>
                <span className="mono flex-1 text-[12.5px] text-text-2">{d.event}</span>
                <span className="num text-text-3">{d.durationMs} ms</span>
                <span className="w-[110px] text-right text-text-3"><Time value={d.at} /></span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel id="trust-model" title="Trust Model" desc="What a proof establishes and what it does not.">
          <TrustModel mode={mode} />
        </Panel>
      </div>
    </div>
  );
}

function Panel({ id, title, desc, children }: { id: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-stage bg-raised p-5 shadow-raised sm:p-6">
      <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{title}</h2>
      <p className="mb-4 mt-0.5 text-[13.5px] text-text-2">{desc}</p>
      {children}
    </section>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><span className="text-[12.5px] font-medium text-text-3">{label}</span>{children}</div>;
}
