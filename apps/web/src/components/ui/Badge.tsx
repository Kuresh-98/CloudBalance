import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'savings' | 'alert' | 'warning' | 'info' | 'ink';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'info',
  size = 'md',
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-bold border-2 border-ink tracking-wide";
  
  const variants = {
    savings: "bg-savings text-surface", // wait, "never white text on a light badge" - savings is green, so white is fine. Or should it be dark? The PRD says "bold dark text in the same hue family — never plain black text on a colored badge, and never white text on a light badge." Wait, "never plain black text on a colored badge". If the token is `--savings`, it's #1E8E3E, which is relatively dark green.
    // The PRD says: "Badges/tags: solid color background from the semantic tokens above, 2px solid var(--ink) border, bold dark text in the same hue family — never plain black text on a colored badge, and never white text on a light badge."
    // Let's use Tailwind's text colors for text, e.g. text-emerald-900 for savings badge.
    alert: "bg-alert text-red-950",
    warning: "bg-warning text-yellow-950",
    info: "bg-info text-blue-950",
    ink: "bg-ink text-surface",
  };

  // Adjusting savings to emerald-950
  const updatedVariants = {
    savings: "bg-savings text-emerald-950",
    alert: "bg-alert text-red-950",
    warning: "bg-warning text-yellow-950",
    info: "bg-info text-blue-950",
    ink: "bg-ink text-surface",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] uppercase rounded",
    md: "px-2.5 py-1 text-xs uppercase rounded-md",
  };

  return (
    <span
      className={twMerge(clsx(
        baseStyle,
        updatedVariants[variant],
        sizes[size],
        className
      ))}
      {...props}
    >
      {children}
    </span>
  );
};
