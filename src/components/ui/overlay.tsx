"use client";

import { X } from "lucide-react";
import { Dialog, DropdownMenu, Popover, Tooltip as RTooltip } from "radix-ui";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <RTooltip.Provider delayDuration={250}>{children}</RTooltip.Provider>;
}
export function Tip({ content, children, side = "top" }: { content: React.ReactNode; children: React.ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <RTooltip.Root>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content side={side} sideOffset={6} className="z-[80] max-w-[260px] rounded-[8px] bg-ink-band px-2.5 py-1.5 text-[12px] leading-snug text-ink-band-text shadow-float [animation:pp-fade_120ms_ease-out]">
          {content}
          <RTooltip.Arrow className="fill-[var(--ink-band)]" />
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}

export const PopoverRoot = Popover.Root;
export const PopoverTrigger = Popover.Trigger;
export function PopoverPanel({ children, className, align = "end" }: { children: React.ReactNode; className?: string; align?: "start" | "center" | "end" }) {
  return (
    <Popover.Portal>
      <Popover.Content align={align} sideOffset={8} className={cn("z-[70] rounded-panel bg-raised p-3 shadow-float [animation:pp-pop_160ms_var(--ease-out)]", className)}>
        {children}
      </Popover.Content>
    </Popover.Portal>
  );
}

export function Modal({ open, onOpenChange, title, description, children, footer, className }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children?: React.ReactNode; footer?: React.ReactNode; className?: string }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-[var(--overlay)] [animation:pp-fade_160ms_ease-out]" />
        <Dialog.Content className={cn("fixed left-1/2 top-1/2 z-[61] w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-stage bg-raised p-6 shadow-float outline-none [animation:pp-pop_200ms_var(--ease-out)]", className)}>
          <Dialog.Title className="text-[18px] font-semibold tracking-[-0.02em]">{title}</Dialog.Title>
          {description ? <Dialog.Description className="mt-1.5 text-[14px] text-text-2">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
          {children && <div className="mt-4">{children}</div>}
          {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
          <Dialog.Close asChild>
            <Button variant="ghost" size="icon-sm" className="absolute right-3 top-3" aria-label="Close">
              <X className="size-4" />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Destructive-action confirmation. */
export function Confirm({ open, onOpenChange, title, description, confirmLabel, onConfirm, loading, danger = true }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string; confirmLabel: string; onConfirm: () => void; loading?: boolean; danger?: boolean }) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}

/** Side sheet on desktop, full-width sheet on small screens. */
export function Sheet({ open, onOpenChange, title, description, children, className }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-[var(--overlay)] [animation:pp-fade_160ms_ease-out]" />
        <Dialog.Content className={cn("fixed inset-y-0 right-0 z-[61] flex w-[min(100vw,460px)] flex-col bg-raised shadow-float outline-none [animation:pp-slide-right_260ms_var(--ease-out)]", className)}>
          <div className="flex items-start gap-3 border-b border-line p-5">
            <div className="grid flex-1 gap-1">
              <Dialog.Title className="text-[17px] font-semibold tracking-[-0.02em]">{title}</Dialog.Title>
              {description ? <Dialog.Description className="text-[13px] text-text-2">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Close">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-auto p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const Menu = DropdownMenu.Root;
export const MenuTrigger = DropdownMenu.Trigger;
export function MenuContent({ children, align = "end", className }: { children: React.ReactNode; align?: "start" | "center" | "end"; className?: string }) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content align={align} sideOffset={6} className={cn("z-[70] min-w-[200px] rounded-panel bg-raised p-1 text-[14px] shadow-float [animation:pp-pop_160ms_var(--ease-out)]", className)}>
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}
export function MenuItem({ children, onSelect, danger, shortcut, icon, asChild }: { children: React.ReactNode; onSelect?: () => void; danger?: boolean; shortcut?: string; icon?: React.ReactNode; asChild?: boolean }) {
  return (
    <DropdownMenu.Item asChild={asChild} onSelect={onSelect} className={cn("flex cursor-default select-none items-center gap-2.5 rounded-[8px] px-2.5 py-2 outline-none data-[highlighted]:bg-lift", danger && "text-bad")}>
      {asChild ? children : <div className="flex w-full items-center gap-2.5">{icon && <span className="text-text-2">{icon}</span>}<span className="flex-1">{children}</span>{shortcut && <kbd className="text-[11px] text-text-3">{shortcut}</kbd>}</div>}
    </DropdownMenu.Item>
  );
}
export const MenuSeparator = () => <DropdownMenu.Separator className="my-1 h-px bg-line" />;
export const MenuLabel = ({ children }: { children: React.ReactNode }) => <DropdownMenu.Label className="px-2.5 py-1.5 text-[12px] text-text-3">{children}</DropdownMenu.Label>;
