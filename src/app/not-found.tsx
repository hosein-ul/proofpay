import Link from "next/link";
import { PlateStack } from "@/components/brand/plate-stack";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-ground px-4 py-16">
      <div className="grid max-w-[440px] justify-items-center gap-5 text-center">
        <PlateStack count={4} lit={-1} size={150} />
        <p className="num text-[13px] font-medium text-text-3">404</p>
        <h1 className="t-h1">That page isn’t here</h1>
        <p className="text-[15px] text-text-2">The link may be old, or the task was removed when the demo data was reset.</p>
        <div className="flex gap-2">
          <Button variant="primary" asChild><Link href="/app">Go to the app</Link></Button>
          <Button variant="secondary" asChild><Link href="/">Home</Link></Button>
        </div>
      </div>
    </main>
  );
}
