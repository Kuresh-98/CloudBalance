import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'warning' | 'savings' | 'alert' | 'glass';
  tilt?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  tilt = false,
  ...props
}) => {
  const baseStyle = "rounded-2xl p-6 transition-all duration-300 ease-out";
  
  const variants = {
    default: "bg-white shadow-premium border border-slate-100",
    muted: "bg-slate-50 border border-slate-100",
    warning: "bg-gradient-to-br from-warning to-warning-hover text-white shadow-premium",
    savings: "bg-gradient-to-br from-savings to-savings-hover text-white shadow-premium",
    alert: "bg-gradient-to-br from-alert to-alert-hover text-white shadow-premium",
    glass: "glass-dark text-white shadow-premium",
  };

  const tiltStyle = tilt ? "hover:-translate-y-1 hover:shadow-premium-hover" : "";

  return (
    <div
      className={twMerge(clsx(
        baseStyle,
        variants[variant],
        tiltStyle,
        className
      ))}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge(clsx("pb-4 mb-4 border-b border-slate-100/20", className))} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
  <h3 className={twMerge(clsx("font-display text-xl font-bold tracking-tight", className))} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => (
  <p className={twMerge(clsx("text-sm text-slate-500 font-body mt-1.5", className))} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge(clsx("font-body", className))} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge(clsx("pt-4 mt-4 flex items-center justify-between border-t border-slate-100/20", className))} {...props}>
    {children}
  </div>
);
