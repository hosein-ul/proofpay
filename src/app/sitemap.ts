import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { USE_CASES } from "@/lib/use-cases";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/product", "/use-cases", ...USE_CASES.map((u) => `/use-cases/${u.slug}`), "/security", "/developers", "/developers/api", "/request-access", "/about", "/status", "/changelog", "/brand", "/legal/terms", "/legal/privacy", "/legal/testnet"];
  return paths.map((p) => ({ url: `${SITE_URL}${p}` }));
}
