"use client";

import {  Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Download, FlaskConical, Keyboard, LayoutGrid, ListChecks, Fingerprint, Moon, Plus, Receipt, Search, Settings, Sun, Users, Wrench, CornerDownLeft } from "lucide-react";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme";
import { Identicon } from "@/components/ui/identicon";
import { StatusChip } from "@/components/ui/chips";
import type { TaskState } from "@/lib/domain/types";
import { useApp } from "./context";

export interface PaletteData {
  tasks: { id: string; title: string; state: TaskState; worker: string }[];
  workers: { id: string; name: string; hue: number; kind: string }[];
}

const RECENT_KEY = "pp-recents";

export function CommandPalette({ data }: { data: PaletteData }) {
  const { paletteOpen, setPaletteOpen, setShortcutsOpen, mode } = useApp();
  const router = useRouter();
  const { toggle } = useTheme();
  const [recents, setRecents] = useState<string[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    try {
      setRecents(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"));
    } catch {}
  }, [paletteOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, setPaletteOpen]);

  function go(href: string, key?: string) {
    setPaletteOpen(false);
    setQ("");
    if (key)
      try {
        const next = [key, ...recents.filter((r) => r !== key)].slice(0, 5);
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
    router.push(href);
  }
  const run = (fn: () => void) => () => {
    setPaletteOpen(false);
    setQ("");
    fn();
  };

  const nav = [
    { id: "overview", label: "Overview", href: "/app", icon: LayoutGrid, k: "G O" },
    { id: "tasks", label: "Tasks", href: "/app/tasks", icon: ListChecks, k: "G T" },
    { id: "proofs", label: "Proofs", href: "/app/proofs", icon: Fingerprint, k: "G P" },
    { id: "ledger", label: "Ledger and audit", href: "/app/ledger", icon: Receipt, k: "G L" },
    { id: "workers", label: "Workers", href: "/app/workers", icon: Users, k: "G W" },
    { id: "tools", label: "Proof tools", href: "/app/tools", icon: Wrench, k: "G T" },
    { id: "settings", label: "Settings", href: "/app/settings", icon: Settings, k: "G S" },
  ];
  const recentItems = recents
    .map((k) => {
      const t = data.tasks.find((x) => `task:${x.id}` === k);
      if (t) return { key: k, label: t.title, href: `/app/tasks/${t.id}`, sub: t.id };
      const w = data.workers.find((x) => `worker:${x.id}` === k);
      if (w) return { key: k, label: w.name, href: `/app/workers?w=${w.id}`, sub: w.kind };
      return null;
    })
    .filter(Boolean) as { key: string; label: string; href: string; sub: string }[];

  const item = "flex cursor-default items-center gap-3 rounded-[9px] px-3 py-2 text-[14px] data-[selected=true]:bg-lift";
  return (
    <Dialog.Root open={paletteOpen} onOpenChange={setPaletteOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-[var(--overlay)] [animation:pp-fade_160ms_ease-out]" />
        <Dialog.Content className="fixed left-1/2 top-[14vh] z-[61] w-[min(94vw,640px)] -translate-x-1/2 overflow-hidden rounded-stage bg-raised shadow-float outline-none [animation:pp-pop_180ms_var(--ease-out)]">
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Dialog.Description className="sr-only">Search pages, tasks and workers, or run an action.</Dialog.Description>
          <Command loop label="Command palette">
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-4 text-text-3" aria-hidden />
              <Command.Input value={q} onValueChange={setQ} placeholder="Search tasks, workers, pages, or run an action…" className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-text-3" />
              <kbd className="rounded-[6px] bg-sunk px-1.5 py-0.5 text-[11px] text-text-3">Esc</kbd>
            </div>
            <Command.List className="max-h-[56vh] overflow-auto p-2">
              <Command.Empty className="px-3 py-10 text-center text-[14px] text-text-3">No matches. Try a task name, a worker, or “new task”.</Command.Empty>
              {!q && recentItems.length > 0 && (
                <Command.Group heading="Recent" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:text-text-3">
                  {recentItems.map((r) => (
                    <Command.Item key={r.key} value={`recent ${r.label}`} onSelect={() => go(r.href, r.key)} className={item}>
                      <span className="flex-1 truncate">{r.label}</span>
                      <span className="mono text-[12px] text-text-3">{r.sub}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:text-text-3">
                <Command.Item value="create task new" onSelect={() => go("/app/tasks/new")} className={item}>
                  <Plus className="size-4 text-light-text" /> <span className="flex-1">Create task</span> <kbd className="text-[11px] text-text-3">N</kbd>
                </Command.Item>
                <Command.Item value="switch mode simulation live" onSelect={run(() => toast.message(mode === "simulation" ? "You are in Simulation" : "You are in Live", { description: "Change the environment in Settings → Environment." }))} className={item}>
                  <FlaskConical className="size-4 text-text-2" /> <span className="flex-1">Switch mode</span> <span className="text-[12px] text-text-3">{mode === "simulation" ? "Simulation" : "Live"}</span>
                </Command.Item>
                <Command.Item value="toggle theme dark light" onSelect={run(toggle)} className={item}>
                  <Sun className="size-4 text-text-2 dark:hidden" /> <Moon className="hidden size-4 text-text-2 dark:block" /> <span className="flex-1">Toggle theme</span> <kbd className="text-[11px] text-text-3">T</kbd>
                </Command.Item>
                <Command.Item value="export ledger csv download" onSelect={run(() => { window.location.assign("/api/ledger?format=csv"); })} className={item}>
                  <Download className="size-4 text-text-2" /> <span className="flex-1">Export ledger (CSV)</span>
                </Command.Item>
                <Command.Item value="keyboard shortcuts help" onSelect={run(() => setShortcutsOpen(true))} className={item}>
                  <Keyboard className="size-4 text-text-2" /> <span className="flex-1">Keyboard shortcuts</span> <kbd className="text-[11px] text-text-3">?</kbd>
                </Command.Item>
              </Command.Group>
              <Command.Group heading="Go to" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:text-text-3">
                {nav.map((n) => (
                  <Command.Item key={n.id} value={`go ${n.label}`} onSelect={() => go(n.href)} className={item}>
                    <n.icon className="size-4 text-text-2" /> <span className="flex-1">{n.label}</span> <kbd className="text-[11px] tracking-widest text-text-3">{n.k}</kbd>
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Tasks" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:text-text-3">
                {data.tasks.slice(0, 40).map((t) => (
                  <Command.Item key={t.id} value={`task ${t.title} ${t.id} ${t.worker} ${t.state}`} onSelect={() => go(`/app/tasks/${t.id}`, `task:${t.id}`)} className={item}>
                    <span className="flex-1 truncate">{t.title}</span>
                    <span className="hidden text-[12px] text-text-3 sm:block">{t.worker}</span>
                    <StatusChip state={t.state} />
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Workers" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:text-text-3">
                {data.workers.map((w) => (
                  <Command.Item key={w.id} value={`worker ${w.name} ${w.kind}`} onSelect={() => go(`/app/workers?w=${w.id}`, `worker:${w.id}`)} className={item}>
                    <Identicon name={w.name} hue={w.hue} size={22} /> <span className="flex-1">{w.name}</span> <span className="text-[12px] text-text-3">{w.kind}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
            <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[12px] text-text-3">
              <span className="flex items-center gap-1.5"><CornerDownLeft className="size-3" /> Open</span>
              <span>↑↓ Navigate</span>
              <span className="ml-auto">⌘K to toggle</span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
