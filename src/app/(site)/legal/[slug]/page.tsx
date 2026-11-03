import { notFound } from "next/navigation";
import { PageHero, Prose } from "@/components/site/prose";

const DOCS: Record<string, { title: string; body: string[] }> = {
  terms: { title: "Terms of use", body: ["The service is a testnet beta provided as is. It holds mock tokens only and has no monetary value.", "You will not use it with real funds or to process regulated activity.", "We may change or end the beta at any time."] },
  privacy: { title: "Privacy notice", body: ["Access requests store the answers you give and a salted hash of your IP address to limit abuse.", "The demo stores preferences, such as theme, in your browser. It does not use advertising cookies.", "Ask us to delete your request by emailing the security contact on the Security page."] },
  testnet: { title: "Testnet notice", body: ["Everything runs on Base Sepolia with a mock USDC token, or in Simulation with no chain at all.", "Contracts have not been independently audited. Do not send real assets to any address shown here."] },
};

export function generateStaticParams() { return Object.keys(DOCS).map((slug) => ({ slug })); }

export default async function Legal({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const d = DOCS[slug];
  if (!d) notFound();
  return (
    <>
      <PageHero eyebrow="Legal template" title={d.title} lead="This is a template for the beta. It has not been reviewed by a lawyer and must be replaced before any launch." />
      <Prose>{d.body.map((p) => <p key={p}>{p}</p>)}</Prose>
    </>
  );
}
