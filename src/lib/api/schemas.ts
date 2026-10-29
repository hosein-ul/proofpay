import { z } from "zod";

export const OpSchema = z.enum([">=", ">", "<=", "<", "=", "!="]);

export const ConditionSchema = z.object({
  sourceId: z.string().min(1),
  sourceName: z.string().min(1),
  url: z.string().url().max(500),
  method: z.literal("GET").default("GET"),
  jsonPath: z.string().min(2).max(200),
  metric: z.string().min(1).max(60).regex(/^[a-z][a-z0-9_ %]*$/i, "Use letters, numbers and underscores."),
  op: OpSchema,
  threshold: z.number().finite(),
  unit: z.string().max(12).optional(),
  disclosure: z.enum(["threshold", "hash", "reveal"]).default("threshold"),
});

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(3, "Give the task a short title.").max(120),
  workerId: z.string().min(1),
  amountUsdc: z.number().positive("Amount must be more than zero.").max(1_000_000),
  condition: ConditionSchema,
  deadline: z.string().datetime(),
  refundPolicy: z.enum(["auto", "payer"]).default("auto"),
});
export type CreateTaskBody = z.infer<typeof CreateTaskSchema>;

export const SubmitProofSchema = z.object({
  /** Simulation: the value the demo source reports for the rule's metric. Live: ignored; the SDK fetches it. */
  value: z.number().finite().optional(),
  actor: z.string().max(80).optional(),
});

export const DisputeSchema = z.object({ note: z.string().trim().min(3, "Say what is wrong.").max(500) });
export const ResolveSchema = z.object({ outcome: z.enum(["release", "refund"]), note: z.string().trim().max(500).default("") });
export const ExpireSchema = z.object({ force: z.boolean().optional() });
export const ModeSchema = z.object({ mode: z.enum(["simulation", "live"]) });

export const AccessRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a work email.").max(200),
  company: z.string().trim().min(2, "Tell us the company.").max(120),
  useCase: z.string().trim().min(10, "A sentence or two helps us route this.").max(1000),
  volume: z.enum(["<10k", "10k-100k", "100k-1m", ">1m", "unsure"]),
  /** honeypot: real people never fill this */
  website: z.string().max(0).optional().default(""),
});
