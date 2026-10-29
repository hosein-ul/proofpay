"use client";

import { Bell, Building2, ChevronsUpDown, Command as CommandIcon, Fingerprint, History, Keyboard, LayoutGrid, ListChecks, Menu as MenuIcon, Monitor, Moon, PanelLeft, Plus, Receipt, Settings, Sun, Users, BookOpen, LogOut, Check } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Logo, Mark } from "@/components/brand/mark";
import { useTheme } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { ChainIcon } from "@/components/ui/marks";
import { ModeBadge } from "@/components/ui/chips";
import { Identicon } from "@/components/ui/identicon";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger, Modal, Sheet, Tip, TooltipProvider } from "@/components/ui/overlay";
import { Time } from "@/components/ui/copy";
import { STATE_LABEL } from "@/lib/domain/types";
import type { Mode, TaskEvent } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { CommandPalette, type PaletteData } from "./command-palette";
import { AppProvider, useApp, type RoleView } from "./context";

const NAV: { href: string; label: string; icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; exact?: boolean }[] = [
  { href: "/app", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/app/tasks", label: "Tasks", icon: ListChecks },
  { href: "/app/proofs", label: "Proofs", icon: Fingerprint },
  { href: "/app/ledger", label: "Ledger", icon: Receipt },
  { href: "/app/workers", label: "Workers", icon: Users },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ mode, palette, counts, children }: { mode: Mode; palette: PaletteData; counts: { tasks: number; attention: number }; children: React.ReactNode }) {
  return (
    <AppProvider mode={mode}>
      <TooltipProvider>
        <ShellInner palette={palette} counts={counts}>
          {children}
        </ShellInner>
      </TooltipProvider>
    </AppProvider>
  );
}

function ShellInner({ palette, counts, children }: { palette: PaletteData; counts: { tasks: number; attention: number }; children: React.ReactNode }) {
  const { mode, setPaletteOpen, mobileNavOpen, setMobileNavOpen } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("pp-sidebar") === "1");
    } catch {}
  }, []);
  useShortcuts();
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem("pp-sidebar", c ? "0" : "1");
      } catch {}
      return !c;
    });

  return (
    <div className="app-root min-h-dvh bg-ground">
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-raised/80 backdrop-blur-md transition-[width] duration-200 ease-[var(--ease-out)] lg:flex", collapsed ? "w-[var(--sidebar-w-collapsed)]" : "w-[var(--sidebar-w)]")}>
        <SidebarBody collapsed={collapsed} counts={counts} onToggle={toggleCollapsed} />
      </aside>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen} title="Menu" className="!right-auto left-0 w-[min(86vw,300px)] [animation:none]">
        <div className="-m-5 flex h-[calc(100%+40px)] flex-col" onClick={() => setMobileNavOpen(false)}>
          <SidebarBody collapsed={false} counts={counts} onToggle={() => {}} hideToggle />
        </div>
      </Sheet>
      <div className={cn("transition-[padding] duration-200 ease-[var(--ease-out)]", collapsed ? "lg:pl-[var(--sidebar-w-collapsed)]" : "lg:pl-[var(--sidebar-w)]")}>
        <Topbar />
        {mode === "simulation" && (
          <div className="border-b border-line bg-light-quiet px-4 py-1.5 text-center text-[12.5px] text-light-text">
            <strong className="font-semibold">Simulation.</strong> Proofs are synthetic and no real funds move. Everything here is labelled demo data.{" "}
            <Link href="/app/settings#trust-model" className="underline underline-offset-2">
              Trust Model
            </Link>
          </div>
        )}
        <main id="main" className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <CommandPalette data={palette} />
      <ShortcutsDialog />
      <ActivityDrawer />
    </div>
  );
}

function SidebarBody({ collapsed, counts, onToggle, hideToggle }: { collapsed: boolean; counts: { tasks: number; attention: number }; onToggle: () => void; hideToggle?: boolean }) {
  const path = usePathname();
  return (
    <>
      <div className={cn("flex h-16 items-center px-4", collapsed && "justify-center px-0")}>
        <Link href="/" aria-label="ProofPay home">
          {collapsed ? <Mark size={28} /> : <Logo />}
        </Link>
      </div>
      <nav aria-label="Primary" className="flex-1 px-3 py-2">
        <ul className="grid gap-0.5">
          {NAV.map((n) => {
            const active = n.exact ? path === n.href : path.startsWith(n.href);
            const Icon = n.icon;
            const count = n.label === "Tasks" ? counts.tasks : undefined;
            const link = (
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn("group relative flex h-9 items-center gap-3 rounded-control px-3 text-[14px] font-medium transition-colors", active ? "bg-lift text-text" : "text-text-2 hover:bg-lift hover:text-text", collapsed && "justify-center px-0")}
              >
                {active && <span className="absolute -left-3 top-2 bottom-2 w-[3px] rounded-r-full bg-light shadow-[0_0_12px_var(--light-glow)]" aria-hidden />}
                <Icon className={cn("size-[17px] shrink-0", active && "text-light-text")} aria-hidden />
                {!collapsed && <span className="flex-1">{n.label}</span>}
                {!collapsed && count !== undefined && <span className="num rounded-full bg-sunk px-1.5 text-[11px] text-text-2">{count}</span>}
                {n.label === "Overview" && counts.attention > 0 && !collapsed && <span className="num rounded-full bg-warn-quiet px-1.5 text-[11px] text-warn" title="Needs attention">{counts.attention}</span>}
              </Link>
            );
            return <li key={n.href}>{collapsed ? <Tip content={n.label} side="right">{link}</Tip> : link}</li>;
          })}
        </ul>
      </nav>
      <div className="grid gap-0.5 border-t border-line p-3">
        <Link href="/developers" className={cn("flex h-9 items-center gap-3 rounded-control px-3 text-[14px] text-text-2 hover:bg-lift hover:text-text", collapsed && "justify-center px-0")}>
          <BookOpen className="size-[17px]" aria-hidden /> {!collapsed && "Docs"}
        </Link>
        {!hideToggle && (
          <button onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className={cn("flex h-9 items-center gap-3 rounded-control px-3 text-[14px] text-text-2 hover:bg-lift hover:text-text", collapsed && "justify-center px-0")}>
            <PanelLeft className="size-[17px]" aria-hidden /> {!collapsed && "Collapse"}
          </button>
        )}
      </div>
    </>
  );
}

function Topbar() {
  const { mode, role, setRole, setPaletteOpen, setMobileNavOpen, setShortcutsOpen, setActivityOpen } = useApp();
  const { theme, setTheme } = useTheme();
  const roles: { id: RoleView; label: string; hint: string }[] = [
    { id: "payer", label: "Payer", hint: "Fund and release" },
    { id: "worker", label: "Worker", hint: "Prove and get paid" },
    { id: "auditor", label: "Auditor", hint: "Read-only" },
  ];
  return (
    <div className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-ground/80 px-3 backdrop-blur-md sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setMobileNavOpen(true)}>
        <MenuIcon className="size-5" />
      </Button>
      <Menu>
        <MenuTrigger asChild>
          <button className="hidden h-9 items-center gap-2.5 rounded-control px-2 text-left hover:bg-lift sm:flex">
            <span className="grid size-6 place-items-center rounded-[7px] bg-ink-band text-ink-band-text"><Building2 className="size-3.5" /></span>
            <span className="grid leading-tight">
              <span className="text-[13px] font-semibold">Northgate Growth</span>
              <span className="text-[11px] text-text-3">Demo workspace</span>
            </span>
            <ChevronsUpDown className="size-3.5 text-text-3" />
          </button>
        </MenuTrigger>
        <MenuContent align="start">
          <MenuLabel>Workspaces</MenuLabel>
          <MenuItem icon={<Check className="size-4 text-light-text" />}>Northgate Growth (demo)</MenuItem>
          <MenuSeparator />
          <MenuItem icon={<Plus className="size-4" />} onSelect={() => {}}>New workspace (not in the beta)</MenuItem>
        </MenuContent>
      </Menu>

      <button
        onClick={() => setPaletteOpen(true)}
        className="ml-1 flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-control bg-sunk px-3 text-[13px] text-text-3 shadow-[0_0_0_1px_var(--line)_inset] transition-shadow hover:shadow-[0_0_0_1px_var(--line-strong)_inset] sm:max-w-[380px]"
        aria-label="Search and commands (Command K)"
      >
        <CommandIcon className="size-4" aria-hidden />
        <span className="truncate">Search or run a command…</span>
        <kbd className="ml-auto hidden rounded-[5px] bg-raised px-1.5 py-0.5 text-[11px] shadow-[0_0_0_1px_var(--line)] sm:block">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <ModeBadge mode={mode} className="hidden sm:inline-flex" />
        <span className="hidden h-6 items-center gap-1.5 rounded-full bg-sunk px-2.5 text-[12px] font-medium text-text-2 md:inline-flex">
          <ChainIcon id="base" size={14} testnet /> Base Sepolia
        </span>
        <Tip content="Activity">
          <Button variant="ghost" size="icon" aria-label="Open activity and notifications" onClick={() => setActivityOpen(true)} className="relative">
            <Bell className="size-[18px]" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-light shadow-[0_0_6px_var(--light-glow)]" />
          </Button>
        </Tip>
        <Menu>
          <MenuTrigger asChild>
            <button className="flex h-9 items-center gap-2 rounded-control pl-1 pr-2 hover:bg-lift" aria-label="Account menu">
              <Identicon name="Maya Okonkwo" hue={250} size={28} />
              <span className="hidden text-[13px] font-medium md:block">Maya</span>
            </button>
          </MenuTrigger>
          <MenuContent>
            <div className="px-2.5 py-2">
              <p className="text-[13px] font-semibold">Maya Okonkwo</p>
              <p className="text-[12px] text-text-3">maya@northgate.example · demo user</p>
            </div>
            <MenuSeparator />
            <MenuLabel>View as</MenuLabel>
            {roles.map((r) => (
              <MenuItem key={r.id} onSelect={() => setRole(r.id)} icon={role === r.id ? <Check className="size-4 text-light-text" /> : <span className="size-4" />}>
                <span className="grid"><span>{r.label}</span><span className="text-[11.5px] text-text-3">{r.hint}</span></span>
              </MenuItem>
            ))}
            <MenuSeparator />
            <MenuLabel>Theme</MenuLabel>
            {([["system", "System", Monitor], ["light", "Light", Sun], ["dark", "Dark", Moon]] as const).map(([id, label, Icon]) => (
              <MenuItem key={id} onSelect={() => setTheme(id)} icon={<Icon className="size-4" />}>
                <span className="flex items-center justify-between">{label}{theme === id && <Check className="size-4 text-light-text" />}</span>
              </MenuItem>
            ))}
            <MenuSeparator />
            <MenuItem onSelect={() => setShortcutsOpen(true)} icon={<Keyboard className="size-4" />} shortcut="?">Keyboard shortcuts</MenuItem>
            <MenuItem asChild icon={<History className="size-4" />}>
              <Link href="/app/settings" className="flex items-center gap-2.5"><Settings className="size-4 text-text-2" /> Settings</Link>
            </MenuItem>
            <MenuItem asChild>
              <Link href="/" className="flex items-center gap-2.5"><LogOut className="size-4 text-text-2" /> Back to website</Link>
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  );
}

/* ── global shortcuts: ⌘K handled by the palette; g+letter navigation, n, t, ? ── */
function useShortcuts() {
  const router = useRouter();
  const { setShortcutsOpen, setPaletteOpen } = useApp();
  const { toggle } = useTheme();
  useEffect(() => {
    let g = 0;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input,textarea,select,[contenteditable],[role=dialog]") || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "?") return setShortcutsOpen(true);
      if (k === "/") {
        e.preventDefault();
        return setPaletteOpen(true);
      }
      if (k === "n") return router.push("/app/tasks/new");
      if (k === "t" && Date.now() - g > 800) return toggle();
      if (k === "g") {
        g = Date.now();
        return;
      }
      if (Date.now() - g < 800) {
        const map: Record<string, string> = { o: "/app", t: "/app/tasks", p: "/app/proofs", l: "/app/ledger", w: "/app/workers", s: "/app/settings" };
        if (map[k]) {
          g = 0;
          router.push(map[k]);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, setShortcutsOpen, setPaletteOpen, toggle]);
}

function ShortcutsDialog() {
  const { shortcutsOpen, setShortcutsOpen } = useApp();
  const rows: [string, string][] = [
    ["⌘K  or  /", "Search and commands"],
    ["N", "New task"],
    ["G then O / T / P / L / W / S", "Go to Overview, Tasks, Proofs, Ledger, Workers, Settings"],
    ["T", "Toggle theme"],
    ["?", "This help"],
    ["↑ ↓  Enter", "Move and open in lists and the palette"],
    ["Esc", "Close any panel"],
  ];
  return (
    <Modal open={shortcutsOpen} onOpenChange={setShortcutsOpen} title="Keyboard shortcuts" description="Everything in ProofPay works from the keyboard.">
      <dl className="grid gap-2.5 text-[14px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-6 border-b border-line pb-2.5 last:border-0">
            <dd className="text-text-2">{v}</dd>
            <dt><kbd className="rounded-[6px] bg-sunk px-2 py-0.5 text-[12px] shadow-[0_0_0_1px_var(--line)]">{k}</kbd></dt>
          </div>
        ))}
      </dl>
    </Modal>
  );
}

function ActivityDrawer() {
  const { activityOpen, setActivityOpen } = useApp();
  const q = useQuery({
    queryKey: ["events", "drawer"],
    enabled: activityOpen,
    queryFn: async () => (await (await fetch("/api/events?limit=30")).json()) as { events: (TaskEvent & { title: string })[] },
  });
  return (
    <Sheet open={activityOpen} onOpenChange={setActivityOpen} title="Activity" description="Every state change, newest first. Event-sourced: this is the audit trail.">
      {!q.data && !q.isError ? (
        <div className="grid gap-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-12" />)}</div>
      ) : q.isError ? (
        <p className="text-[14px] text-bad">We couldn’t load activity. Check your connection and try again.</p>
      ) : (
        <ol className="grid gap-1">
          {q.data!.events.map((e) => (
            <li key={e.id}>
              <Link href={`/app/tasks/${e.taskId}`} onClick={() => setActivityOpen(false)} className="grid gap-0.5 rounded-control px-3 py-2.5 hover:bg-lift">
                <span className="flex items-baseline gap-2">
                  <span className="text-[14px] font-medium">{e.title}</span>
                  <span className="ml-auto text-[12px] text-text-3"><Time value={e.at} /></span>
                </span>
                <span className="text-[12.5px] text-text-2">
                  {e.to ? `${STATE_LABEL[e.to]} · ` : ""}
                  {e.type.replace(/_/g, " ")} by {e.actorName}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Sheet>
  );
}
