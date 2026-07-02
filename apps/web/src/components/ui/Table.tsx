import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge(clsx("w-full overflow-auto rounded-xl border border-border bg-white shadow-sm", className))} {...props}>
    {children}
  </div>
);

export const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={twMerge(clsx("w-full caption-bottom text-sm", className))}
      {...props}
    />
  )
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={twMerge(clsx("[&_tr]:border-b bg-surfaceMuted/50", className))} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={twMerge(clsx("[&_tr:last-child]:border-0", className))}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={twMerge(clsx("border-b border-border transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50", className))}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={twMerge(clsx("h-12 px-4 text-left align-middle font-medium text-textMuted uppercase tracking-wider text-xs", className))}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement> & { isNumeric?: boolean }>(
  ({ className, isNumeric, ...props }, ref) => (
    <td
      ref={ref}
      className={twMerge(clsx("p-4 align-middle text-text", isNumeric && "font-mono font-medium", className))}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";
