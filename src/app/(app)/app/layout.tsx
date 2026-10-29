import { AppShell } from "@/components/app/shell";
import { attentionQueue, getMode, listTasks, listWorkers } from "@/lib/server/repo";
import { OPEN_STATES } from "@/lib/domain/state-machine";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [mode, tasks, workers, attention] = await Promise.all([getMode(), listTasks(), listWorkers(), attentionQueue()]);
  const wName = new Map(workers.map((w) => [w.id, w.name]));
  return (
    <AppShell
      mode={mode}
      counts={{ tasks: tasks.filter((t) => OPEN_STATES.includes(t.state)).length, attention: attention.length }}
      palette={{
        tasks: tasks.map((t) => ({ id: t.id, title: t.title, state: t.state, worker: wName.get(t.workerId) ?? "" })),
        workers: workers.map((w) => ({ id: w.id, name: w.name, hue: w.hue, kind: w.kind })),
      }}
    >
      {children}
    </AppShell>
  );
}
