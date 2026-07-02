import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'savings' | 'alert' | 'warning' | 'info' | 'neutral' | 'ink';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  ...props
}) => {
  const baseStyle = "inline-flex items-center font-semibold rounded-full select-none";

  const variants = {
    savings: "bg-emerald-100 text-emerald-700",
    alert: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
    neutral: "bg-slate-100 text-slate-700",
    ink: "bg-slate-900 text-white",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-[10px] tracking-wide uppercase",
    md: "px-3 py-1 text-xs tracking-wide",
  };

  return (
    <span
      className={twMerge(clsx(
        baseStyle,
        variants[variant],
        sizes[size],
        className
      ))}
      {...props}
    >
      {children}
    </span>
  );
};
