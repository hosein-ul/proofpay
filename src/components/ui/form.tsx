"use client";

import { Check, ChevronDown, CircleAlert, Search } from "lucide-react";
import { Command } from "cmdk";
import { Checkbox as RCheckbox, Popover, RadioGroup as RRadio, Select as RSelect, Switch as RSwitch, ToggleGroup } from "radix-ui";
import { createContext, forwardRef, useContext, useId, useState } from "react";
import { cn } from "@/lib/utils";

/** Gives the control inside a Field its id, description and invalid state, so the label is really associated with it. */
const FieldCtx = createContext<{ id: string; describedBy?: string; invalid: boolean } | null>(null);
export const useField = () => useContext(FieldCtx);

export function Field({
  label,
  hint,
  error,
  children,
  className,
  htmlFor,
  optional,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  optional?: boolean;
}) {
  const auto = useId();
  const id = htmlFor ?? auto;
  const describedBy = error || hint ? `${id}-desc` : undefined;
  return (
    <FieldCtx.Provider value={{ id, describedBy, invalid: !!error }}>
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline gap-2 text-[13px] font-medium text-text">
        {label}
        {optional && <span className="text-[12px] font-normal text-text-3">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={describedBy} role="alert" className="flex items-center gap-1.5 text-[12.5px] text-bad">
          <CircleAlert className="size-3.5 shrink-0" aria-hidden /> {error}
        </p>
      ) : hint ? (
        <p id={describedBy} className="text-[12.5px] text-text-3">{hint}</p>
      ) : null}
    </div>
    </FieldCtx.Provider>
  );
}

const inputBase =
  "w-full rounded-control bg-sunk text-text placeholder:text-text-3 shadow-[0_0_0_1px_var(--line-strong)_inset] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--light)_40%,var(--line-strong))_inset] focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--light)_inset,0_0_0_4px_var(--light-quiet)] aria-[invalid=true]:shadow-[0_0_0_1px_var(--bad)_inset] disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; unit?: string; leading?: React.ReactNode }>(function Input(
  { className, invalid, unit, leading, ...props },
  ref,
) {
  const f = useField();
  props.id ??= f?.id;
  props["aria-describedby"] ??= f?.describedBy;
  invalid ??= f?.invalid;
  return (
    <div className="relative">
      {leading && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-3">{leading}</span>}
      <input ref={ref} aria-invalid={invalid || undefined} className={cn(inputBase, "h-10 px-3 text-[14px]", leading && "pl-9", unit && "pr-14", className)} {...props} />
      {unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12.5px] font-medium text-text-3">{unit}</span>}
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(function Textarea({ className, invalid, ...props }, ref) {
  const f = useField();
  props.id ??= f?.id;
  props["aria-describedby"] ??= f?.describedBy;
  invalid ??= f?.invalid;
  return <textarea ref={ref} aria-invalid={invalid || undefined} className={cn(inputBase, "min-h-[88px] resize-y px-3 py-2.5 text-[14px]", className)} {...props} />;
});

/** Number field with a unit. Keeps the text the person typed; parses on change. */
export function NumberInput({ value, onChange, unit, min, max, step = 1, className, id, invalid, placeholder }: { value: number | ""; onChange: (n: number | "") => void; unit?: string; min?: number; max?: number; step?: number; className?: string; id?: string; invalid?: boolean; placeholder?: string }) {
  return (
    <Input
      id={id}
      inputMode="decimal"
      invalid={invalid}
      unit={unit}
      placeholder={placeholder}
      className={cn("num", className)}
      value={value === "" ? "" : String(value)}
      onChange={(e) => {
        const raw = e.target.value.replace(/,/g, "");
        if (raw === "") return onChange("");
        const n = Number(raw);
        if (!Number.isNaN(n)) onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n)));
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const n = (value === "" ? 0 : value) + (e.key === "ArrowUp" ? step : -step);
          onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n)));
        }
      }}
    />
  );
}

/* ── select (Radix) ── */
export function Select<T extends string>({ value, onValueChange, options, placeholder, id, className, "aria-label": al }: { value: T; onValueChange: (v: T) => void; options: { value: T; label: string; hint?: string }[]; placeholder?: string; id?: string; className?: string; "aria-label"?: string }) {
  const f = useField();
  return (
    <RSelect.Root value={value} onValueChange={(v) => onValueChange(v as T)}>
      <RSelect.Trigger id={id ?? f?.id} aria-describedby={f?.describedBy} aria-label={al} className={cn(inputBase, "inline-flex h-10 items-center justify-between gap-2 px-3 text-left text-[14px] data-[placeholder]:text-text-3", className)}>
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon>
          <ChevronDown className="size-4 text-text-3" />
        </RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content position="popper" sideOffset={6} className="z-[70] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-panel bg-raised p-1 text-[14px] shadow-float [animation:pp-pop_160ms_var(--ease-out)]">
          <RSelect.Viewport>
            {options.map((o) => (
              <RSelect.Item key={o.value} value={o.value} className="relative flex cursor-default select-none items-center justify-between gap-3 rounded-[8px] px-2.5 py-2 outline-none data-[highlighted]:bg-lift data-[state=checked]:font-medium">
                <span>
                  <RSelect.ItemText>{o.label}</RSelect.ItemText>
                  {o.hint && <span className="block text-[12px] font-normal text-text-3">{o.hint}</span>}
                </span>
                <RSelect.ItemIndicator>
                  <Check className="size-4 text-light-text" />
                </RSelect.ItemIndicator>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}

/* ── switch / checkbox / radio ── */
export function Switch({ checked, onCheckedChange, id, label, disabled }: { checked: boolean; onCheckedChange: (v: boolean) => void; id?: string; label?: string; disabled?: boolean }) {
  return (
    <RSwitch.Root id={id} aria-label={label} disabled={disabled} checked={checked} onCheckedChange={onCheckedChange} className="relative h-[22px] w-[40px] shrink-0 rounded-full bg-sunk shadow-[0_0_0_1px_var(--line-strong)_inset] transition-colors duration-200 data-[state=checked]:bg-light disabled:opacity-50">
      <RSwitch.Thumb className="block size-[16px] translate-x-[3px] rounded-full bg-raised shadow-[0_1px_2px_rgb(0_0_0/.3)] transition-transform duration-200 ease-[cubic-bezier(.16,1,.3,1)] data-[state=checked]:translate-x-[21px]" />
    </RSwitch.Root>
  );
}

export function Checkbox({ checked, onCheckedChange, id, label }: { checked: boolean | "indeterminate"; onCheckedChange: (v: boolean) => void; id?: string; label?: string }) {
  return (
    <RCheckbox.Root id={id} aria-label={label} checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} className="grid size-[18px] shrink-0 place-items-center rounded-[5px] bg-sunk shadow-[0_0_0_1px_var(--line-strong)_inset] transition-colors data-[state=checked]:bg-light data-[state=checked]:text-on-light data-[state=indeterminate]:bg-light data-[state=indeterminate]:text-on-light">
      <RCheckbox.Indicator>
        {checked === "indeterminate" ? <span className="block h-0.5 w-2.5 rounded bg-current" /> : <Check className="size-3.5" strokeWidth={3} />}
      </RCheckbox.Indicator>
    </RCheckbox.Root>
  );
}

export function RadioCards<T extends string>({ value, onValueChange, options, className }: { value: T; onValueChange: (v: T) => void; options: { value: T; title: string; body: string; icon?: React.ReactNode }[]; className?: string }) {
  const id = useId();
  return (
    <RRadio.Root value={value} onValueChange={(v) => onValueChange(v as T)} className={cn("grid gap-2", className)}>
      {options.map((o) => (
        <RRadio.Item key={o.value} value={o.value} id={`${id}-${o.value}`} className="group flex items-start gap-3 rounded-panel bg-raised p-3.5 text-left shadow-rest transition-[box-shadow] hover:shadow-[0_0_0_1px_var(--line-strong)] data-[state=checked]:shadow-[0_0_0_1.5px_var(--light),0_0_0_5px_var(--light-quiet)]">
          {o.icon && <span className="mt-0.5 text-text-2">{o.icon}</span>}
          <span className="grid gap-0.5">
            <span className="text-[14px] font-medium">{o.title}</span>
            <span className="text-[13px] text-text-2">{o.body}</span>
          </span>
          <span className="ml-auto mt-1 grid size-4 shrink-0 place-items-center rounded-full shadow-[0_0_0_1px_var(--line-strong)_inset] group-data-[state=checked]:bg-light">
            <RRadio.Indicator className="size-1.5 rounded-full bg-on-light" />
          </span>
        </RRadio.Item>
      ))}
    </RRadio.Root>
  );
}

/* ── segmented control ── */
export function Segmented<T extends string>({ value, onValueChange, options, size = "md", className, "aria-label": al }: { value: T; onValueChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; size?: "sm" | "md"; className?: string; "aria-label"?: string }) {
  return (
    <ToggleGroup.Root type="single" value={value} onValueChange={(v) => v && onValueChange(v as T)} aria-label={al} className={cn("inline-flex rounded-control bg-sunk p-[3px] shadow-[0_0_0_1px_var(--line)_inset]", className)}>
      {options.map((o) => (
        <ToggleGroup.Item key={o.value} value={o.value} className={cn("rounded-[6px] font-medium text-text-2 transition-[background,color,box-shadow] duration-150 hover:text-text data-[state=on]:bg-raised data-[state=on]:text-text data-[state=on]:shadow-[0_1px_0_var(--top)_inset,0_0_0_1px_var(--line),0_1px_2px_rgb(10_21_48/.08)]", size === "sm" ? "h-6 px-2.5 text-[12px]" : "h-7 px-3 text-[13px]")}>
          {o.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

/* ── combobox (cmdk in a popover) ── */
export function Combobox<T extends string>({ value, onValueChange, options, placeholder = "Select…", searchPlaceholder = "Search…", empty = "Nothing found.", id, className }: { value: T | ""; onValueChange: (v: T) => void; options: { value: T; label: string; hint?: string; icon?: React.ReactNode }[]; placeholder?: string; searchPlaceholder?: string; empty?: string; id?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const sel = options.find((o) => o.value === value);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger id={id} className={cn(inputBase, "inline-flex h-10 items-center justify-between gap-2 px-3 text-left text-[14px]", !sel && "text-text-3", className)}>
        <span className="flex min-w-0 items-center gap-2 truncate">
          {sel?.icon}
          {sel ? sel.label : placeholder}
        </span>
        <ChevronDown className="size-4 text-text-3" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={6} align="start" className="z-[70] w-[var(--radix-popover-trigger-width)] min-w-[260px] overflow-hidden rounded-panel bg-raised shadow-float [animation:pp-pop_160ms_var(--ease-out)]">
          <Command>
            <div className="flex items-center gap-2 border-b border-line px-3">
              <Search className="size-4 text-text-3" />
              <Command.Input placeholder={searchPlaceholder} className="h-10 flex-1 bg-transparent text-[14px] outline-none placeholder:text-text-3" />
            </div>
            <Command.List className="max-h-64 overflow-auto p-1">
              <Command.Empty className="px-3 py-6 text-center text-[13px] text-text-3">{empty}</Command.Empty>
              {options.map((o) => (
                <Command.Item key={o.value} value={`${o.label} ${o.hint ?? ""}`} onSelect={() => { onValueChange(o.value); setOpen(false); }} className="flex cursor-default items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[14px] data-[selected=true]:bg-lift">
                  {o.icon}
                  <span className="grid min-w-0">
                    <span className="truncate">{o.label}</span>
                    {o.hint && <span className="truncate text-[12px] text-text-3">{o.hint}</span>}
                  </span>
                  {o.value === value && <Check className="ml-auto size-4 text-light-text" />}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
