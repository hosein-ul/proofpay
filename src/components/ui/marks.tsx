import TokenUSDC from "@web3icons/react/icons/tokens/TokenUSDC";
import TokenETH from "@web3icons/react/icons/tokens/TokenETH";
import NetworkBase from "@web3icons/react/icons/networks/NetworkBase";
import NetworkEthereum from "@web3icons/react/icons/networks/NetworkEthereum";
import {
  siAirtable,
  siAnthropic,
  siCloudflare,
  siDatadog,
  siFigma,
  siGithub,
  siGitlab,
  siGoogleads,
  siGoogleanalytics,
  siHubspot,
  siIntercom,
  siJira,
  siLinear,
  siMailchimp,
  siMeta,
  siMixpanel,
  siNotion,
  siPagerduty,
  siQuickbooks,
  siSentry,
  siShopify,
  siStatuspage,
  siStripe,
  siSupabase,
  siTiktok,
  siVercel,
  siWise,
  siXero,
  siYoutube,
  siZapier,
} from "simple-icons";
import { cn } from "@/lib/utils";

/**
 * Real-world marks, wrapped once. Rules (see .design/direction.md):
 *  - tokens and chains come from @web3icons (maintained set), brands from simple-icons;
 *  - never redraw or recolour; mono (currentColor) is a neutral rendering of the unedited glyph;
 *  - any wall of marks carries <MarksCaption/>: compatibility, not partnership.
 * Source and licence notes: docs/assets.md.
 */

export type TokenId = "USDC" | "ETH";
export function TokenIcon({ id, size = 20, className }: { id: TokenId; size?: number; className?: string }) {
  const C = id === "USDC" ? TokenUSDC : TokenETH;
  return <C variant="branded" size={size} className={cn("shrink-0 rounded-full", className)} aria-label={id} role="img" />;
}

export type ChainId = "base" | "ethereum";
export function ChainIcon({ id, size = 20, className, testnet }: { id: ChainId; size?: number; className?: string; testnet?: boolean }) {
  const C = id === "base" ? NetworkBase : NetworkEthereum;
  return (
    <span className={cn("relative inline-grid shrink-0", className)} style={{ width: size, height: size }}>
      <C variant="branded" size={size} className="rounded-full" aria-label={id === "base" ? "Base" : "Ethereum"} role="img" />
      {testnet && <span className="absolute -bottom-0.5 -right-0.5 size-[7px] rounded-full bg-light shadow-[0_0_0_1.5px_var(--raised)]" title="Testnet" />}
    </span>
  );
}

/** USDC on Base Sepolia: asset badge over network badge, as the domain convention expects. */
export function TokenOnChain({ size = 24 }: { size?: number }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <TokenIcon id="USDC" size={size} />
      <span className="absolute -bottom-1 -right-1 rounded-full bg-raised p-[1.5px]">
        <ChainIcon id="base" size={Math.round(size * 0.5)} />
      </span>
    </span>
  );
}

const BRANDS = {
  stripe: siStripe,
  github: siGithub,
  gitlab: siGitlab,
  shopify: siShopify,
  hubspot: siHubspot,
  linear: siLinear,
  notion: siNotion,
  vercel: siVercel,
  googleads: siGoogleads,
  googleanalytics: siGoogleanalytics,
  meta: siMeta,
  datadog: siDatadog,
  zapier: siZapier,
  mixpanel: siMixpanel,
  airtable: siAirtable,
  cloudflare: siCloudflare,
  intercom: siIntercom,
  jira: siJira,
  sentry: siSentry,
  pagerduty: siPagerduty,
  supabase: siSupabase,
  figma: siFigma,
  tiktok: siTiktok,
  youtube: siYoutube,
  wise: siWise,
  quickbooks: siQuickbooks,
  xero: siXero,
  statuspage: siStatuspage,
  mailchimp: siMailchimp,
  anthropic: siAnthropic,
} as const;
export type BrandId = keyof typeof BRANDS;
export const BRAND_IDS = Object.keys(BRANDS) as BrandId[];

export function BrandMark({ id, size = 22, tone = "mono", className }: { id: BrandId; size?: number; tone?: "mono" | "brand"; className?: string }) {
  const b = BRANDS[id];
  if (!b)
    return (
      <span className={cn("inline-grid place-items-center rounded-md bg-sunk text-[10px] font-semibold text-text-3", className)} style={{ width: size, height: size }} aria-label={String(id)}>
        {String(id).slice(0, 2).toUpperCase()}
      </span>
    );
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={b.title} className={cn("shrink-0", tone === "mono" && "text-text-2", className)} fill={tone === "brand" ? `#${b.hex}` : "currentColor"}>
      <path d={b.path} />
    </svg>
  );
}
export const brandTitle = (id: BrandId) => BRANDS[id].title;

export function MarksCaption({ className }: { className?: string }) {
  return <p className={cn("text-[12px] text-text-3", className)}>Marks belong to their owners. They show systems a proof can be built on, not partnerships or endorsements.</p>;
}
