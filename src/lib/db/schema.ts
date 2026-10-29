import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { Attestation, Condition } from "@/lib/domain/types";

export const workers = sqliteTable("workers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  address: text("address").notNull(),
  hue: integer("hue").notNull(),
  bio: text("bio").notNull(),
  createdAt: text("created_at").notNull(),
});

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    workerId: text("worker_id").notNull(),
    amount: integer("amount").notNull(),
    token: text("token").notNull().default("USDC"),
    condition: text("condition", { mode: "json" }).$type<Condition>().notNull(),
    deadline: text("deadline").notNull(),
    refundPolicy: text("refund_policy").notNull().default("auto"),
    state: text("state").notNull(),
    payer: text("payer").notNull(),
    conditionHash: text("condition_hash").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    fundedAt: text("funded_at"),
    settledAt: text("settled_at"),
    mode: text("mode").notNull().default("simulation"),
    demo: integer("demo", { mode: "boolean" }).notNull().default(true),
  },
  (t) => [index("tasks_state_idx").on(t.state), index("tasks_worker_idx").on(t.workerId)],
);

export const events = sqliteTable(
  "events",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id").notNull(),
    type: text("type").notNull(),
    fromState: text("from_state"),
    toState: text("to_state"),
    actorRole: text("actor_role").notNull(),
    actorName: text("actor_name").notNull(),
    at: text("at").notNull(),
    txHash: text("tx_hash"),
    note: text("note"),
  },
  (t) => [index("events_task_idx").on(t.taskId, t.at)],
);

export const ledger = sqliteTable(
  "ledger",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id").notNull(),
    kind: text("kind").notNull(),
    debit: text("debit").notNull(),
    credit: text("credit").notNull(),
    amount: integer("amount").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    at: text("at").notNull(),
    txHash: text("tx_hash"),
  },
  (t) => [index("ledger_at_idx").on(t.at)],
);

export const attestations = sqliteTable(
  "attestations",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id").notNull(),
    digest: text("digest").notNull(),
    json: text("json", { mode: "json" }).$type<Attestation>().notNull(),
    ok: integer("ok", { mode: "boolean" }),
    verification: text("verification", { mode: "json" }),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("att_task_idx").on(t.taskId)],
);

export const consumedProofs = sqliteTable("consumed_proofs", {
  digest: text("digest").primaryKey(),
  taskId: text("task_id").notNull(),
  at: text("at").notNull(),
});

export const accessRequests = sqliteTable("access_requests", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  useCase: text("use_case").notNull(),
  volume: text("volume").notNull(),
  createdAt: text("created_at").notNull(),
  ipHash: text("ip_hash"),
});

export const idempotency = sqliteTable("idempotency", {
  key: text("key").primaryKey(),
  route: text("route").notNull(),
  status: integer("status").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});

export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  lastActive: text("last_active"),
});

export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  prefix: text("prefix").notNull(),
  scope: text("scope").notNull(),
  createdAt: text("created_at").notNull(),
  lastUsed: text("last_used"),
});

export const webhooks = sqliteTable("webhooks", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  events: text("events", { mode: "json" }).$type<string[]>().notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const webhookDeliveries = sqliteTable("webhook_deliveries", {
  id: text("id").primaryKey(),
  webhookId: text("webhook_id").notNull(),
  event: text("event").notNull(),
  status: integer("status").notNull(),
  durationMs: integer("duration_ms").notNull(),
  at: text("at").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
