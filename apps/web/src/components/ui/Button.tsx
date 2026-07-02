import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'savings' | 'alert' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  isPill?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isPill = false,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 font-display font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-primary-hover text-white shadow-premium hover:shadow-premium-hover focus:ring-primary",
    secondary: "bg-white text-ink border border-slate-200 shadow-sm hover:shadow-premium hover:border-slate-300 focus:ring-slate-200",
    savings: "bg-gradient-to-r from-savings to-savings-hover text-white shadow-premium hover:shadow-premium-hover focus:ring-savings",
    alert: "bg-gradient-to-r from-alert to-alert-hover text-white shadow-premium hover:shadow-premium-hover focus:ring-alert",
    warning: "bg-gradient-to-r from-warning to-warning-hover text-white shadow-premium hover:shadow-premium-hover focus:ring-warning",
    info: "bg-gradient-to-r from-info to-info-hover text-white shadow-premium hover:shadow-premium-hover focus:ring-info",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md",
    md: "px-5 py-2.5 text-sm rounded-lg",
    lg: "px-7 py-3 text-base rounded-xl",
  };

  const roundedStyle = isPill ? "rounded-full" : sizes[size].split(' ').pop();

  // Strip the explicit rounded from sizes if isPill is true
  const finalSize = isPill ? sizes[size].replace(/rounded-(md|lg|xl)/, '') : sizes[size];

  return (
    <button
      className={twMerge(clsx(
        baseStyle,
        variants[variant],
        finalSize,
        roundedStyle,
        className
      ))}
      {...props}
    >
      {children}
    </button>
  );
};
