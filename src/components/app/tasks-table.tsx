"use client";

import { flexRender } from "@tanstack/react-table";
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useLegacyTable, type LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

type SortingState = { id: string; desc: boolean }[];
type VisibilityState = Record<string, boolean>;
type RowSel = Record<string, true>;
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, Copy, Download, ExternalLink, Filter, Plus, Rows3, Search, Star, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Chip, StatusChip } from "@/components/ui/chips";
import { Time } from "@/components/ui/copy";
import { Pagination } from "@/components/ui/data";
import { EmptyState } from "@/components/ui/feedback";
import { Checkbox, Combobox, Input, Segmented } from "@/components/ui/form";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger, PopoverPanel, PopoverRoot, PopoverTrigger, Tip } from "@/components/ui/overlay";
import { Identicon } from "@/components/ui/identicon";
import { useTheme } from "@/components/theme";
import { conditionText } from "@/lib/domain/condition";
import { STATE_LABEL, TASK_STATES, type Task, type TaskState, type Worker } from "@/lib/domain/types";
import { formatUsdc } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AmountCell, Deadline } from "./task-bits";

export interface TaskRow extends Task {
  worker: Worker;
  attention: boolean;
}

const ORDER: Record<TaskState, number> = { disputed: 0, expired: 1, proving: 2, awaiting_proof: 3, verified: 4, funded: 5, draft: 6, settled: 7, resolved: 8, refunded: 9 };
type View = { id: string; label: string; states?: TaskState[]; attention?: boolean; custom?: boolean };
const VIEWS: View[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open", states: ["funded", "awaiting_proof", "proving", "verified"] },
  { id: "attention", label: "Needs attention", attention: true },
  { id: "settled", label: "Settled", states: ["settled", "resolved"] },
  { id: "drafts", label: "Drafts", states: ["draft"] },
];

export function TasksTable({ rows, workers, initialView = "all" }: { rows: TaskRow[]; workers: Worker[]; initialView?: string }) {
  const router = useRouter();
  const { density, setDensity } = useTheme();
  const [view, setView] = useState(initialView);
  const [customViews, setCustomViews] = useState<(View & { states: TaskState[]; worker?: string })[]>([]);
  const [q, setQ] = useState("");
  const [states, setStates] = useState<TaskState[]>([]);
  const [worker, setWorker] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedAt", desc: true }]);
  const [vis, setVis] = useState<VisibilityState>({ condition: true });
  const [sel, setSel] = useState<RowSel>({});
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setCustomViews(JSON.parse(localStorage.getItem("pp-task-views") ?? "[]"));
    } catch {}
  }, []);

  const base = [...VIEWS, ...customViews];
  const current = base.find((v) => v.id === view) ?? VIEWS[0];
  const data = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (current.states && !current.states.includes(r.state)) return false;
      if (current.attention && !r.attention) return false;
      if (states.length && !states.includes(r.state)) return false;
      if (worker && r.workerId !== worker) return false;
      if (needle && !`${r.title} ${r.id} ${r.worker.name} ${conditionText(r.condition)}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [rows, current, states, worker, q]);

  const columns = useMemo<ColumnDef<TaskRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => <Checkbox label="Select all on page" checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false} onCheckedChange={(v) => table.toggleAllPageRowsSelected(v)} />,
        cell: ({ row }) => <Checkbox label={`Select ${row.original.title}`} checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(v)} />,
      },
      { id: "state", header: "Status", accessorFn: (r) => ORDER[r.state], cell: ({ row }) => <StatusChip state={row.original.state} /> },
      {
        id: "title",
        header: "Task",
        accessorFn: (r) => r.title,
        cell: ({ row }) => (
          <div className="min-w-0">
            <Link href={`/app/tasks/${row.original.id}`} className="block truncate font-medium hover:text-light-text">
              {row.original.title}
            </Link>
            <span className="mono block text-[11.5px] text-text-3">{row.original.id}</span>
          </div>
        ),
      },
      {
        id: "worker",
        header: "Worker",
        accessorFn: (r) => r.worker.name,
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-2">
            <Identicon name={row.original.worker.name} hue={row.original.worker.hue} size={22} />
            {row.original.worker.name}
          </span>
        ),
      },
      { id: "condition", header: "Condition", accessorFn: (r) => conditionText(r.condition), cell: ({ getValue }) => <span className="text-text-2">{String(getValue())}</span> },
      { id: "amount", header: "Amount", accessorFn: (r) => r.amount, meta: { align: "right" }, cell: ({ row }) => <AmountCell micro={row.original.amount} /> },
      { id: "deadline", header: "Deadline", accessorFn: (r) => r.deadline, cell: ({ row }) => <Deadline iso={row.original.deadline} state={row.original.state} /> },
      { id: "updatedAt", header: "Last activity", accessorFn: (r) => r.updatedAt, cell: ({ row }) => <Time value={row.original.updatedAt} className="text-text-3" /> },
    ],
    [],
  );

  const table = useLegacyTable({
    data,
    columns,
    state: { sorting, columnVisibility: vis, rowSelection: sel },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setVis,
    onRowSelectionChange: setSel,
    getRowId: (r) => r.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 20 } },
  });
  const pageRows = table.getRowModel().rows;
  const selected = Object.keys(sel);

  useEffect(() => setActive(0), [q, view, states, worker, sorting]);

  function exportCsv(list: TaskRow[]) {
    const head = ["id", "title", "status", "worker", "condition", "amount_usdc", "deadline", "last_activity", "mode"];
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = list.map((r) => [r.id, esc(r.title), r.state, esc(r.worker.name), esc(conditionText(r.condition)), formatUsdc(r.amount, { full: true }), r.deadline, r.updatedAt, r.demo ? "simulation (demo data)" : r.mode].join(","));
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "proofpay-tasks.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Exported ${list.length} task${list.length === 1 ? "" : "s"}`, { description: "Demo data from Simulation." });
  }

  function onKey(e: React.KeyboardEvent) {
    if ((e.target as HTMLElement).closest("input,button,a,[role=checkbox],[role=combobox]")) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(pageRows.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && pageRows[active]) router.push(`/app/tasks/${pageRows[active].original.id}`);
    else if (e.key === " " && pageRows[active]) {
      e.preventDefault();
      pageRows[active].toggleSelected();
    }
  }
  useEffect(() => {
    wrap.current?.querySelector<HTMLElement>(`[data-row="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const hasFilters = !!(q || states.length || worker);
  const saveView = () => {
    const label = window.prompt("Name this view");
    if (!label) return;
    const v = { id: `c_${Date.now()}`, label, states: states.length ? states : (current.states ?? []), custom: true, worker: worker || undefined };
    const next = [...customViews, v];
    setCustomViews(next);
    setView(v.id);
    try {
      localStorage.setItem("pp-task-views", JSON.stringify(next));
    } catch {}
    toast.success(`Saved view “${label}”`);
  };

  return (
    <div className="overflow-hidden rounded-panel bg-raised shadow-raised">
      {/* views */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-line px-3 pt-2">
        {base.map((v) => {
          const n = rows.filter((r) => (!v.states || v.states.includes(r.state)) && (!v.attention || r.attention)).length;
          return (
            <button key={v.id} onClick={() => setView(v.id)} aria-pressed={view === v.id} className={cn("relative inline-flex h-9 items-center gap-2 whitespace-nowrap px-3 text-[13.5px] font-medium text-text-2 hover:text-text", view === v.id && "text-text")}>
              {v.custom && <Star className="size-3 text-light-text" />}
              {v.label}
              <span className="num rounded-full bg-sunk px-1.5 text-[11px] text-text-2">{v.custom ? "" : n}</span>
              {view === v.id && <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-light" />}
            </button>
          );
        })}
      </div>
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3">
        <div className="w-full sm:w-[260px]">
          <Input leading={<Search className="size-4" />} placeholder="Search tasks, workers, rules…" aria-label="Search tasks" value={q} onChange={(e) => setQ(e.target.value)} className="!h-9" />
        </div>
        <PopoverRoot>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm">
              <Filter className="size-3.5" /> Status {states.length > 0 && <span className="num rounded-full bg-light-quiet px-1.5 text-[11px] text-light-text">{states.length}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverPanel align="start" className="w-[220px]">
            <div className="grid gap-1">
              {TASK_STATES.map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-2.5 rounded-[8px] px-2 py-1.5 hover:bg-lift">
                  <Checkbox label={STATE_LABEL[s]} checked={states.includes(s)} onCheckedChange={(v) => setStates((cur) => (v ? [...cur, s] : cur.filter((x) => x !== s)))} />
                  <StatusChip state={s} />
                </label>
              ))}
              {states.length > 0 && (
                <Button variant="ghost" size="xs" onClick={() => setStates([])} className="mt-1 justify-start">
                  Clear
                </Button>
              )}
            </div>
          </PopoverPanel>
        </PopoverRoot>
        <div className="w-[190px]">
          <Combobox value={worker} onValueChange={(v) => setWorker(v === worker ? "" : v)} placeholder="Any worker" searchPlaceholder="Find a worker…" options={workers.map((w) => ({ value: w.id, label: w.name, hint: w.kind, icon: <Identicon name={w.name} hue={w.hue} size={20} /> }))} className="!h-9 !text-[13px]" />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setQ(""); setStates([]); setWorker(""); }}>
            <X className="size-3.5" /> Clear
          </Button>
        )}
        {hasFilters && !customViews.some(() => false) && (
          <Button variant="ghost" size="sm" onClick={saveView}>
            <Star className="size-3.5" /> Save view
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <Segmented size="sm" aria-label="Density" value={density} onValueChange={setDensity} options={[{ value: "comfortable", label: <Rows3 className="size-3.5" aria-label="Comfortable" /> }, { value: "compact", label: <Rows3 className="size-3.5 scale-y-75" aria-label="Compact" /> }]} />
          <Menu>
            <MenuTrigger asChild>
              <Button variant="secondary" size="sm">
                <Columns3 className="size-3.5" /> Columns
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuLabel>Show columns</MenuLabel>
              {table.getAllLeafColumns().filter((c) => c.getCanHide()).map((c) => (
                <MenuItem key={c.id} onSelect={() => c.toggleVisibility()} icon={<Checkbox label={c.id} checked={c.getIsVisible()} onCheckedChange={(v) => c.toggleVisibility(v)} />}>
                  {typeof c.columnDef.header === "string" ? c.columnDef.header : c.id}
                </MenuItem>
              ))}
            </MenuContent>
          </Menu>
          <Button variant="secondary" size="sm" onClick={() => exportCsv(data)}>
            <Download className="size-3.5" /> Export
          </Button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 border-y border-line bg-light-quiet px-4 py-2 text-[13px]" role="status">
          <span className="font-medium">{selected.length} selected</span>
          <Button size="xs" variant="secondary" onClick={() => exportCsv(rows.filter((r) => sel[r.id]))}>
            <Download className="size-3" /> Export selected
          </Button>
          <Button size="xs" variant="secondary" onClick={() => { navigator.clipboard?.writeText(selected.join(", ")); toast.success("Task ids copied"); }}>
            <Copy className="size-3" /> Copy ids
          </Button>
          <Button size="xs" variant="ghost" className="ml-auto" onClick={() => setSel({})}>
            Clear selection
          </Button>
        </div>
      )}

      {data.length === 0 ? (
        <EmptyState
          title={rows.length === 0 ? "No tasks yet" : "No tasks match these filters"}
          body={rows.length === 0 ? "A task locks funds against a condition. Write the rule, fund it, and the worker proves it." : "Try removing a filter, or search for a different worker or rule."}
          action={rows.length === 0 ? <Button variant="primary" asChild><Link href="/app/tasks/new"><Plus className="size-4" /> Create your first task</Link></Button> : <Button variant="secondary" onClick={() => { setQ(""); setStates([]); setWorker(""); setView("all"); }}>Clear filters</Button>}
        />
      ) : (
        <div ref={wrap} tabIndex={0} onKeyDown={onKey} aria-label="Tasks table. Use arrow keys to move, Enter to open, Space to select." className="max-h-[calc(100dvh-320px)] min-h-[320px] overflow-auto outline-none focus-visible:shadow-[0_0_0_2px_var(--focus)_inset]">
          <table className="w-full min-w-[920px] text-[13.5px]">
            <thead className="sticky top-0 z-[1] bg-sunk text-left text-[12px] text-text-3">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => {
                    const right = (h.column.columnDef.meta as { align?: string } | undefined)?.align === "right";
                    const sorted = h.column.getIsSorted();
                    return (
                      <th key={h.id} scope="col" aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"} className={cn("h-9 px-3 font-medium first:pl-4 last:pr-4", right && "text-right", h.id === "select" && "w-10")}>
                        {h.column.getCanSort() ? (
                          <button onClick={h.column.getToggleSortingHandler()} className={cn("inline-flex items-center gap-1 hover:text-text", sorted && "text-text")}>
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {sorted === "asc" ? <ArrowUp className="size-3" /> : sorted === "desc" ? <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3 opacity-40" />}
                          </button>
                        ) : (
                          flexRender(h.column.columnDef.header, h.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={row.id} data-row={i} aria-selected={row.getIsSelected()} onClick={(e) => { if (!(e.target as HTMLElement).closest("a,button,[role=checkbox]")) setActive(i); }} onDoubleClick={() => router.push(`/app/tasks/${row.original.id}`)} className={cn("group relative border-t border-line transition-colors hover:bg-lift", i === active && "bg-lift shadow-[inset_3px_0_0_var(--light)]", row.getIsSelected() && "bg-light-quiet")}>
                  {row.getVisibleCells().map((c) => {
                    const right = (c.column.columnDef.meta as { align?: string } | undefined)?.align === "right";
                    return (
                      <td key={c.id} className={cn("h-[var(--row-h)] max-w-[280px] px-3 first:pl-4 last:pr-4", right && "text-right")}>
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </td>
                    );
                  })}
                  <td className="w-0 p-0">
                    <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-control bg-raised p-1 opacity-0 shadow-float transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                      <Tip content="Open task">
                        <Button asChild variant="ghost" size="icon-sm"><Link href={`/app/tasks/${row.original.id}`} aria-label="Open task"><ExternalLink className="size-3.5" /></Link></Button>
                      </Tip>
                      <Tip content="Copy id">
                        <Button variant="ghost" size="icon-sm" aria-label="Copy task id" onClick={() => { navigator.clipboard?.writeText(row.original.id); toast.success("Task id copied"); }}><Copy className="size-3.5" /></Button>
                      </Tip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data.length > 0 && <Pagination page={table.getState().pagination.pageIndex + 1} pages={table.getPageCount()} onPage={(p) => table.setPageIndex(p - 1)} total={data.length} perPage={20} />}
      <Chip className="sr-only">{data.length} results</Chip>
    </div>
  );
}
