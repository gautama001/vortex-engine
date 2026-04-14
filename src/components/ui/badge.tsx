import type React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "danger" | "info" | "success";
};

const toneClasses = {
  danger: "border-rose-400/25 bg-rose-400/10 text-rose-100",
  info: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  success: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
};

export const Badge = ({ className, tone = "info", ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
};
