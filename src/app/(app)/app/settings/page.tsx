import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { SettingsView } from "@/components/app/settings-view";
import { getMode, settingsData } from "@/lib/server/repo";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [mode, data] = await Promise.all([getMode(), settingsData()]);
  return (
    <>
      <PageHeader title="Settings" description="Workspace, access and environment." />
      <SettingsView mode={mode} liveConfigured={!!(process.env.PRIMUS_APP_ID && process.env.PRIMUS_APP_SECRET)} {...data} />
    </>
  );
}
