import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type ButtonVariant = "ghost" | "primary" | "secondary";
type ButtonSize = "default" | "lg" | "sm";

const variantClasses: Record<ButtonVariant, string> = {
  ghost:
    "border border-white/10 bg-white/5 text-slate-100 hover:border-white/20 hover:bg-white/10",
  primary:
    "border border-cyan-300/40 bg-cyan-300 text-slate-950 shadow-[0_0_60px_-24px_rgba(103,232,249,0.85)] hover:bg-cyan-200",
  secondary:
    "border border-white/10 bg-slate-950/70 text-slate-100 hover:border-cyan-300/30 hover:bg-slate-900/80",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
  sm: "h-9 px-4 text-xs uppercase tracking-[0.24em]",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size = "default", variant = "primary", ...props }, ref) => {
    const Component = asChild ? Slot : "button";

    return (
      <Component
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition duration-200 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
