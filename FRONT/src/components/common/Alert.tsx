import type { ReactNode } from "react";

type AlertVariant = "error" | "success" | "warning";

const variantClasses: Record<
  AlertVariant,
  { container: string; dot: string; text: string }
> = {
  error: {
    container:
      "border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10",
    dot: "bg-red-500",
    text: "text-red-800 dark:text-red-300",
  },
  success: {
    container:
      "animate-fade-in border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10",
    dot: "bg-emerald-500 animate-pulse",
    text: "text-emerald-800 dark:text-emerald-300",
  },
  warning: {
    container:
      "border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10",
    dot: "bg-amber-500",
    text: "text-amber-800 dark:text-amber-300",
  },
};

interface AlertProps {
  variant: AlertVariant;
  align?: "center" | "start";
  children: ReactNode;
}

export default function Alert({ variant, align = "center", children }: AlertProps) {
  const classes = variantClasses[variant];
  return (
    <div
      className={`rounded-xl border p-4 flex gap-3 ${
        align === "start" ? "items-start" : "items-center"
      } ${classes.container}`}
    >
      <div
        className={`h-2 w-2 rounded-full shrink-0 ${align === "start" ? "mt-1.5" : ""} ${classes.dot}`}
      />
      <div className={`text-sm font-medium ${classes.text}`}>{children}</div>
    </div>
  );
}
