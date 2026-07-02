import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'warning' | 'savings' | 'alert';
  tilt?: boolean; // For the signature elements
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  tilt = false,
  ...props
}) => {
  const baseStyle = "border-2 border-ink shadow-neobrutal rounded-md p-6 bg-white transition-all duration-100";
  
  const variants = {
    default: "bg-white",
    muted: "bg-surfaceMuted",
    warning: "bg-warning",
    savings: "bg-savings text-white",
    alert: "bg-alert text-white",
  };

  const tiltStyle = tilt ? "rotate-[-2deg] hover:rotate-0" : "";

  return (
    <div
      className={clsx(
        baseStyle,
        variants[variant],
        tiltStyle,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={clsx("border-b-2 border-ink pb-4 mb-4", className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
  <h3 className={clsx("font-display text-xl font-black tracking-tight", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => (
  <p className={clsx("text-sm text-textMuted font-body mt-1", className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={clsx("font-body", className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={clsx("border-t-2 border-ink pt-4 mt-4 flex items-center justify-between", className)} {...props}>
    {children}
  </div>
);
