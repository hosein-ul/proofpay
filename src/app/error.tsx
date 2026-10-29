"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-ground px-4 py-16">
      <div className="grid max-w-[460px] gap-4 text-center">
        <h1 className="t-h1">Something broke on our side</h1>
        <p className="text-[15px] text-text-2">Nothing was changed on your tasks. Try again, and if it keeps happening, share the reference below.</p>
        {error.digest && <p className="mono text-[12px] text-text-3">ref {error.digest}</p>}
        <div className="flex justify-center gap-2"><Button variant="primary" onClick={reset}>Try again</Button></div>
      </div>
    </main>
  );
}
