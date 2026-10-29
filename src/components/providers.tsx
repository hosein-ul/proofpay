"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme";

// sonner is only needed once something calls toast(); load it after hydration instead of in the first bundle.
const Toaster = dynamic(() => import("sonner").then((m) => m.Toaster), { ssr: false });

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 10_000, refetchOnWindowFocus: false } } }),
  );
  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast:
                  "!bg-raised !text-text !border-0 !shadow-float !rounded-panel !font-sans !text-[13px]",
                description: "!text-text-2",
              },
            }}
          />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
