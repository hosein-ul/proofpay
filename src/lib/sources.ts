import { PARTNER_API_BASE } from "./config";
import type { BrandId } from "@/components/ui/marks";

export interface Metric {
  key: string;
  label: string;
  path: string;
  unit?: string;
  hint: string;
  suggest: { op: ">=" | "<="; threshold: number };
}
export interface Source {
  id: string;
  name: string;
  blurb: string;
  url: (key: string) => string;
  metrics: Metric[];
}

/** The two sources ProofPay ships with: the demo partner API (see /partner-api). */
export const SOURCES: Source[] = [
  {
    id: "demo-campaign",
    name: "Campaign stats",
    blurb: "Conversions and leads for a marketing campaign. Demo partner API.",
    url: (k) => `${PARTNER_API_BASE}/api/campaigns/${k}/stats`,
    metrics: [
      { key: "conversions", label: "Conversions", path: "$.stats.conversions", hint: "Completed goals attributed to the campaign.", suggest: { op: ">=", threshold: 120 } },
      { key: "qualified_leads", label: "Qualified leads", path: "$.stats.qualified_leads", hint: "Leads that passed the qualification rule.", suggest: { op: ">=", threshold: 400 } },
      { key: "spend_usd", label: "Spend", path: "$.stats.spend_usd", unit: "USD", hint: "Amount spent so far. Useful for caps.", suggest: { op: "<=", threshold: 50000 } },
    ],
  },
  {
    id: "demo-job",
    name: "Job status",
    blurb: "Progress of a job, uptime of a service, or a work queue. Demo partner API.",
    url: (k) => `${PARTNER_API_BASE}/api/jobs/${k}/progress`,
    metrics: [
      { key: "p95_ms", label: "p95 latency", path: "$.p95_ms", unit: "ms", hint: "95th-percentile response time.", suggest: { op: "<=", threshold: 240 } },
      { key: "pages_migrated", label: "Pages migrated", path: "$.job.pages_migrated", hint: "Items completed by the job.", suggest: { op: ">=", threshold: 212 } },
      { key: "report_rows", label: "Report rows", path: "$.report.rows", hint: "Rows delivered in a report.", suggest: { op: ">=", threshold: 5000 } },
      { key: "open_tickets", label: "Open tickets", path: "$.queue.open_tickets", hint: "Size of a support queue.", suggest: { op: "<=", threshold: 15 } },
      { key: "checks_passing", label: "Checks passing", path: "$.checks.passing", hint: "Passing tests or checks.", suggest: { op: ">=", threshold: 38 } },
    ],
  },
];

/** Systems a proof could be built on. Shown honestly: each needs its own Primus template, so none are selectable yet. */
export const TEMPLATE_IDEAS: { id: BrandId; name: string; example: string }[] = [
  { id: "googleads", name: "Google Ads", example: "Conversions for a campaign" },
  { id: "meta", name: "Meta Ads", example: "Qualified leads" },
  { id: "stripe", name: "Stripe", example: "Revenue above a threshold" },
  { id: "github", name: "GitHub", example: "A pull request merged" },
  { id: "shopify", name: "Shopify", example: "Orders fulfilled" },
  { id: "hubspot", name: "HubSpot", example: "Meetings booked" },
  { id: "linear", name: "Linear", example: "Issues closed in a cycle" },
  { id: "datadog", name: "Datadog", example: "Uptime over a month" },
];
