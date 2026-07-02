import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'savings' | 'alert' | 'warning' | 'info' | 'ghost';
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
  const baseStyle = "inline-flex items-center justify-center gap-2 font-display font-bold transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:pointer-events-none border-2 border-ink shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";
  
  const variants = {
    primary: "bg-ink text-white",
    secondary: "bg-surface text-ink",
    savings: "bg-savings text-white",
    alert: "bg-alert text-white",
    warning: "bg-warning text-ink", // yellow badge needs dark text
    info: "bg-info text-white",
    ghost: "bg-transparent text-ink border-transparent shadow-none hover:bg-surfaceMuted hover:shadow-brutal hover:border-ink hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md",
    md: "px-5 py-2.5 text-sm rounded-lg",
    lg: "px-7 py-3 text-base rounded-xl",
  };

  const roundedStyle = isPill ? "rounded-full" : sizes[size].split(' ').pop();

  const finalSize = isPill ? sizes[size].replace(/rounded-(md|lg|xl)/, '') : sizes[size];

  return (
    <button
      className={twMerge(clsx(
        variant !== 'ghost' && baseStyle,
        variant === 'ghost' && "inline-flex items-center justify-center gap-2 font-display font-bold transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:pointer-events-none border-2",
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
