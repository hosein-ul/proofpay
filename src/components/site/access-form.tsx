"use client";

import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";

export function AccessForm() {
  const [v, setV] = useState({ email: "", company: "", useCase: "", volume: "unsure", website: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const m = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/access-requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(v) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const e: Record<string, string> = {};
        for (const i of j.error?.issues ?? []) e[i.path] = i.message;
        setErrs(e);
        throw new Error(j.error?.message ?? "Couldn’t send that");
      }
    },
  });

  if (m.isSuccess)
    return (
      <div role="status" className="grid gap-3 rounded-stage bg-raised p-8 shadow-raised">
        <span className="grid size-9 place-items-center rounded-full bg-ok-quiet text-ok"><Check className="size-5" strokeWidth={3} /></span>
        <h2 className="text-[20px] font-semibold">Request received</h2>
        <p className="text-[14.5px] text-text-2">We read every one. Expect a reply from a person, not a sequence. Early access is limited to the testnet beta.</p>
      </div>
    );

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); setErrs({}); m.mutate(); }} className="grid gap-4 rounded-stage bg-raised p-6 shadow-raised">
      <Field label="Work email" error={errs.email}><Input type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
      <Field label="Company" error={errs.company}><Input autoComplete="organization" value={v.company} onChange={(e) => setV({ ...v, company: e.target.value })} /></Field>
      <Field label="What would you pay for with proof?" error={errs.useCase}><Textarea rows={4} value={v.useCase} onChange={(e) => setV({ ...v, useCase: e.target.value })} /></Field>
      <Field label="Expected monthly volume" hint="Rough is fine. Testnet only for now.">
        <Select value={v.volume} onValueChange={(x) => setV({ ...v, volume: x })} options={[{ value: "<10k", label: "Under $10k" }, { value: "10k-100k", label: "$10k–100k" }, { value: "100k-1m", label: "$100k–1M" }, { value: ">1m", label: "Over $1M" }, { value: "unsure", label: "Not sure yet" }]} />
      </Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" value={v.website} onChange={(e) => setV({ ...v, website: e.target.value })} />
      {m.isError && !Object.keys(errs).length && <p role="alert" className="text-[13.5px] text-bad">{(m.error as Error).message}. Try again in a minute.</p>}
      <Button type="submit" variant="primary" loading={m.isPending}>Request early access</Button>
      <p className="text-[12.5px] text-text-3">We store your answers and a hash of your IP to limit abuse. No marketing list, no pricing yet.</p>
    </form>
  );
}
