import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'savings' | 'alert' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  isPill?: boolean; // Reserved for the one hero CTA
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isPill = false,
  ...props
}) => {
  const baseStyle = "font-bold font-display border-2 border-ink shadow-neobrutal transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-neobrutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#0A0A0A] focus:outline-none select-none text-center inline-flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-ink text-white hover:bg-neutral-800",
    secondary: "bg-white text-ink hover:bg-surfaceMuted",
    savings: "bg-savings text-white hover:bg-emerald-800",
    alert: "bg-alert text-white hover:bg-red-800",
    warning: "bg-warning text-ink hover:bg-amber-500",
    info: "bg-info text-white hover:bg-blue-800",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-sm",
    md: "px-5 py-2.5 text-sm rounded-md",
    lg: "px-7 py-3 text-base rounded-lg",
  };

  const pillStyle = isPill ? "rounded-full" : "";

  return (
    <button
      className={clsx(
        baseStyle,
        variants[variant],
        sizes[size],
        pillStyle,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
