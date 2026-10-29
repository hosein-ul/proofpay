"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/form";
import { Time } from "@/components/ui/copy";
import { Chip } from "@/components/ui/chips";
import { VolumeChart } from "@/components/ui/volume-chart";
import { STATE_LABEL, type Overview, type TaskEvent, type Tone } from "@/lib/domain/types";
import { formatUsdc } from "@/lib/format";
import { cn } from "@/lib/utils";

export function VolumePanel({ initial }: { initial: Overview }) {
  const [range, setRange] = useState<"7" | "30" | "90">("30");
  const q = useQuery({
    queryKey: ["overview", range],
    queryFn: async () => (await (await fetch(`/api/overview?range=${range}`)).json()) as Overview,
    initialData: range === "30" ? initial : undefined,
    placeholderData: (p) => p,
  });
  const total = q.data?.volume.reduce((s, d) => s + d.amount, 0) ?? 0;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
        <div>
          <h2 className="text-[14px] font-semibold tracking-[-0.01em]">Settlement volume</h2>
          <p className="num mt-0.5 text-[12.5px] text-text-3">
            {formatUsdc(total)} USDC released in {range} days · demo data
          </p>
        </div>
        <Segmented size="sm" aria-label="Range" value={range} onValueChange={setRange} options={[{ value: "7", label: "7d" }, { value: "30", label: "30d" }, { value: "90", label: "90d" }]} />
      </div>
      <div className="px-2 pb-3 pt-2">{q.data ? <VolumeChart data={q.data.volume} /> : <div className="skeleton m-2 h-[220px]" />}</div>
    </div>
  );
}

const EVENT_TONE: Record<string, Tone> = { settled: "ok", verified: "info", proof_failed: "bad", expired: "warn", refunded: "mute", disputed: "bad", resolved: "ok", funded: "info", proof_started: "warn", task_created: "mute", awaiting_proof: "info", proof_submitted: "warn" };
const EVENT_LABEL: Record<string, string> = { settled: "Settled", verified: "Verified", proof_failed: "Proof failed", expired: "Expired", refunded: "Refunded", disputed: "Disputed", resolved: "Resolved", funded: "Funded", proof_started: "Proving", task_created: "Created", awaiting_proof: "Awaiting proof", proof_submitted: "Proof submitted" };

type Ev = TaskEvent & { title: string };
export function LiveFeed({ initial, canDemo }: { initial: Ev[]; canDemo: boolean }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["events", "feed"],
    queryFn: async () => ((await (await fetch("/api/events?limit=9&significant=1")).json()) as { events: Ev[] }).events,
    initialData: initial,
    refetchInterval: 5000,
  });
  const demo = useMutation({
    mutationFn: async () => {
      const list = (await (await fetch("/api/tasks?state=awaiting_proof")).json()) as { tasks: { id: string; title: string; condition: { threshold: number; op: string } }[] };
      const t = list.tasks[0];
      if (!t) throw new Error("No task is waiting for a proof. Create and fund one first.");
      const r = await fetch(`/api/tasks/${t.id}/proof`, {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
        body: JSON.stringify({ value: t.condition.op.startsWith("<") ? t.condition.threshold - 5 : t.condition.threshold + 12, actor: "Demo worker" }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message ?? "Failed");
      return { title: t.title, settled: j.settled as boolean };
    },
    onSuccess: (r) => {
      toast.success(r.settled ? `Proof verified, funds released` : "Proof submitted", { description: `${r.title} · Simulation` });
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Couldn’t run the demo proof", { description: e.message }),
  });
  return (
    <div>
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <h2 className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.01em]">
          <span className="relative grid size-2 place-items-center"><span className="absolute inline-block size-2 rounded-full bg-light [animation:pp-ping_2.4s_ease-out_infinite]" /></span>
          Live proof feed
        </h2>
        {canDemo && (
          <Button size="xs" variant="secondary" className="ml-auto" loading={demo.isPending} onClick={() => demo.mutate()}>
            <Play className="size-3" /> Run a demo proof
          </Button>
        )}
      </div>
      <ol className="relative px-4 pb-3">
        <AnimatePresence initial={false}>
          {q.data.map((e) => (
            <motion.li key={e.id} layout initial={{ opacity: 0, y: -12, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0 }} transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
              <Link href={`/app/tasks/${e.taskId}`} className="group flex items-center gap-3 border-t border-line py-2.5 first:border-t-0">
                <Chip tone={EVENT_TONE[e.type] ?? "mute"} className="w-[104px] shrink-0 justify-center">
                  {EVENT_LABEL[e.type] ?? e.type.replace(/_/g, " ")}
                </Chip>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium group-hover:text-light-text">{e.title}</span>
                  <span className="block truncate text-[12px] text-text-3">
                    {e.actorName}
                    {e.to ? ` · ${STATE_LABEL[e.to]}` : ""}
                  </span>
                </span>
                <Time value={e.at} className="text-[12px] text-text-3" />
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </div>
  );
}

export function cnx(...a: string[]) {
  return cn(...a);
}
