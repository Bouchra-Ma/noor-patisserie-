import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const baseClasses =
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-amber-500 text-white shadow-lg shadow-amber-500/25 hover:bg-amber-400 hover:shadow-amber-500/30 focus-visible:ring-amber-400",
  secondary:
    "backdrop-blur-md bg-white/70 text-slate-800 border border-white/60 shadow-sm hover:bg-white/90 hover:border-white/80 focus-visible:ring-slate-300",
  ghost:
    "bg-transparent text-slate-700 hover:bg-white/50 hover:text-slate-900 focus-visible:ring-slate-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs rounded-lg",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-12 px-6 text-sm rounded-xl",
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  leftIcon,
  rightIcon,
  asChild,
  ...props
}: ButtonProps) {
  const compClassName = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className
  );

  if (asChild && isValidElement(children)) {
    return cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: cn(compClassName, (children as React.ReactElement<{ className?: string }>).props?.className),
    });
  }

  return (
    <button className={compClassName} {...props}>
      {leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
    </button>
  );
}
