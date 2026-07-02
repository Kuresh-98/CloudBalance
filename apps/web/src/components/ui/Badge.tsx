import React from 'react';
import { clsx } from 'clsx';

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
  const baseStyle = "inline-flex items-center font-mono font-bold border-2 border-ink select-none";

  const variants = {
    // Light background, dark text of same hue family, thick border
    savings: "bg-[#E8F5E9] text-[#1B5E20]", // Green family
    alert: "bg-[#FFEBEE] text-[#C62828]",   // Red family
    warning: "bg-[#FFF8E1] text-[#E65100]", // Yellow/Orange family
    info: "bg-[#E3F2FD] text-[#0D47A1]",    // Blue family
    neutral: "bg-[#F5F5F5] text-[#212121]", // Gray family
    ink: "bg-ink text-white",               // Solid black / white text
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] rounded",
    md: "px-3 py-1 text-xs rounded",
  };

  return (
    <span
      className={clsx(
        baseStyle,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
