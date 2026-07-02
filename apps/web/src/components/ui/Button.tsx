import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'savings' | 'alert' | 'warning' | 'info' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-sm focus:ring-primary",
    secondary: "bg-white text-text border border-border shadow-sm hover:bg-surfaceMuted focus:ring-border",
    savings: "bg-savings text-white hover:bg-savings-hover shadow-sm focus:ring-savings",
    alert: "bg-alert text-white hover:bg-alert-hover shadow-sm focus:ring-alert",
    warning: "bg-warning text-white hover:bg-warning-hover shadow-sm focus:ring-warning",
    info: "bg-info text-white hover:bg-info-hover shadow-sm focus:ring-info",
    ghost: "bg-transparent text-textMuted hover:text-text hover:bg-surfaceMuted",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={twMerge(clsx(
        baseStyle,
        variants[variant],
        sizes[size],
        className
      ))}
      {...props}
    >
      {children}
    </button>
  );
};
