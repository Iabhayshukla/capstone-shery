import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "brand";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-white/70 border-white/10",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/15 text-red-400 border-red-500/20",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  brand: "bg-brand-primary/15 text-brand-primary border-brand-primary/20",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-white/50",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-blue-400",
  brand: "bg-brand-primary",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

const Badge = ({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className,
}: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
