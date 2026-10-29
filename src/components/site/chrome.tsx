import Link from "next/link";
import { Logo } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";
import { BETA_LABEL, PRIMUS_DOCS, PRODUCT_NAME } from "@/lib/config";

const NAV = [
  ["Product", "/product"],
  ["Use cases", "/use-cases"],
  ["Security", "/security"],
  ["Developers", "/developers"],
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ground/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5">
        <Link href="/" aria-label={`${PRODUCT_NAME} home`}><Logo /></Link>
        <span className="hidden rounded-full bg-light-quiet px-2 py-0.5 text-[11.5px] font-medium text-light-text sm:inline">{BETA_LABEL}</span>
        <nav aria-label="Main" className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map(([l, h]) => <Link key={h} href={h} className="rounded-control px-3 py-1.5 text-[14px] text-text-2 hover:bg-sunk hover:text-text">{l}</Link>)}
        </nav>
        <span className="flex-1" />
        <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex"><Link href="/app">Open demo</Link></Button>
        <Button variant="primary" size="sm" asChild><Link href="/request-access">Request early access</Link></Button>
      </div>
      <nav aria-label="Main mobile" className="flex gap-1 overflow-x-auto border-t border-line px-4 py-1.5 md:hidden">
        {NAV.map(([l, h]) => <Link key={h} href={h} className="shrink-0 rounded-control px-3 py-1 text-[13.5px] text-text-2">{l}</Link>)}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const cols: [string, [string, string][]][] = [
    ["Product", [["Overview", "/product"], ["Use cases", "/use-cases"], ["Open the demo", "/app"], ["Changelog", "/changelog"]]],
    ["Developers", [["Docs", "/developers"], ["API reference", "/developers/api"], ["Status", "/status"], ["Brand assets", "/brand"]]],
    ["Company", [["About", "/about"], ["Security", "/security"], ["Request access", "/request-access"]]],
    ["Legal (templates)", [["Terms", "/legal/terms"], ["Privacy", "/legal/privacy"], ["Testnet notice", "/legal/testnet"]]],
  ];
  return (
    <footer className="border-t border-line bg-sunk">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="grid content-start gap-3">
          <Logo />
          <p className="max-w-[260px] text-[13.5px] text-text-2">Pay when it’s proven. Escrow that releases funds when a verified fact says so.</p>
          <p className="text-[12.5px] text-text-3">{BETA_LABEL}. Mock USDC on Base Sepolia. No real funds.</p>
        </div>
        {cols.map(([t, ls]) => (
          <nav key={t} aria-label={t} className="grid content-start gap-2 text-[13.5px]">
            <p className="font-semibold">{t}</p>
            {ls.map(([l, h]) => <Link key={h} href={h} className="text-text-2 hover:text-text">{l}</Link>)}
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1200px] px-5 py-5 text-[12.5px] text-text-3">
          Proofs by <a href={PRIMUS_DOCS} className="underline underline-offset-2 hover:text-text" rel="noreferrer">Primus zkTLS</a>. {PRODUCT_NAME} is independent software built on it and is not endorsed by or affiliated with Primus. Marks belong to their owners.
        </p>
      </div>
    </footer>
  );
}
