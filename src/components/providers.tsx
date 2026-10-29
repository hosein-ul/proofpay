"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 10_000, refetchOnWindowFocus: false } } }),
  );
  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
        <MotionConfig reducedMotion="user">
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
        </MotionConfig>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
