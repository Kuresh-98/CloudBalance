import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'savings' | 'alert' | 'warning' | 'info' | 'primary' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'info',
  size = 'md',
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-full";
  
  const variants = {
    savings: "bg-emerald-100 text-emerald-800",
    alert: "bg-red-100 text-red-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-blue-100 text-blue-800",
    primary: "bg-slate-100 text-slate-800",
    outline: "bg-transparent text-textMuted border border-border",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
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
