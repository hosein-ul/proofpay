"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { LoaderCircle } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const buttonStyles = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium select-none outline-offset-2 transition-[transform,box-shadow,background-color,color] duration-[160ms] ease-[cubic-bezier(.16,1,.3,1)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-busy:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[linear-gradient(180deg,var(--light-hi),var(--light))] text-on-light shadow-[0_1px_0_rgb(255_255_255/.6)_inset,0_0_0_1px_rgb(160_100_0/.28),0_10px_26px_-10px_var(--light-glow)] hover:shadow-[0_1px_0_rgb(255_255_255/.6)_inset,0_0_0_1px_rgb(160_100_0/.4),0_14px_34px_-8px_var(--light-glow)] font-semibold",
        secondary: "bg-raised text-text shadow-rest hover:shadow-[0_1px_0_var(--top)_inset,0_0_0_1px_color-mix(in_oklab,var(--light)_55%,var(--line-strong))] hover:bg-lift",
        ghost: "text-text-2 hover:bg-lift hover:text-text",
        danger: "bg-bad-quiet text-bad shadow-[0_0_0_1px_color-mix(in_oklab,var(--bad)_25%,transparent)] hover:shadow-[0_0_0_1px_var(--bad)]",
        link: "text-light-text underline-offset-4 hover:underline h-auto px-0",
      },
      size: {
        md: "h-10 rounded-control px-4 text-[14px]",
        sm: "h-[34px] rounded-control px-3 text-[13px]",
        xs: "h-7 rounded-[6px] px-2.5 text-[12px]",
        lg: "h-12 rounded-control px-6 text-[15px]",
        icon: "h-9 w-9 rounded-control",
        "icon-sm": "h-7 w-7 rounded-[6px]",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, loading, children, disabled, ...props },
  ref,
) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp ref={ref} className={cn(buttonStyles({ variant, size }), className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {asChild ? (
        children
      ) : (
        <>
          {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {children}
        </>
      )}
    </Comp>
  );
});
