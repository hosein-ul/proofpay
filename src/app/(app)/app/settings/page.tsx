import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { SettingsView } from "@/components/app/settings-view";
import { liveConfig } from "@/lib/server/primus";
import { getMode, settingsData } from "@/lib/server/repo";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

// Booleans only. The values themselves never reach the page.
function readiness() {
  const c = liveConfig();
  return [
    { key: "PRIMUS_APP_ID", ok: !!c.appId, why: "From the Primus Developer Hub project" },
    { key: "PRIMUS_APP_SECRET", ok: !!c.appSecret, why: "Shown once when the project is created. Server only" },
    { key: "PRIMUS_TEMPLATE_ID", ok: !!c.templateId, why: "The template for your partner-API request" },
    { key: "PRIMUS_ATTESTORS", ok: c.attestors.length > 0, why: "Attestor addresses the backend trusts" },
    { key: "ESCROW_ADDRESS", ok: !!process.env.ESCROW_ADDRESS, why: "After deploying contracts/ to Base Sepolia" },
  ];
}

export default async function SettingsPage() {
  const [mode, data] = await Promise.all([getMode(), settingsData()]);
  return (
    <>
      <PageHeader title="Settings" description="Workspace, access and environment." />
      <SettingsView mode={mode} liveConfigured={liveConfig().ready} readiness={readiness()} {...data} />
    </>
  );
}
