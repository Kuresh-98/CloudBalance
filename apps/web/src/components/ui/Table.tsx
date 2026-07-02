import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge(clsx("border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white w-full", className))} {...props}>
    <div className="overflow-x-auto">
      {children}
    </div>
  </div>
);

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ children, className, ...props }) => (
  <table className={twMerge(clsx("w-full text-left border-collapse", className))} {...props}>
    {children}
  </table>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <thead className={twMerge(clsx("bg-slate-50 border-b border-slate-200 select-none", className))} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <tbody className={twMerge(clsx("divide-y divide-slate-100", className))} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className, ...props }) => (
  <tr className={twMerge(clsx("hover:bg-slate-50/50 transition-colors", className))} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <th className={twMerge(clsx("px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider", className))} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement> & { isNumeric?: boolean }> = ({ children, className, isNumeric = false, ...props }) => (
  <td
    className={twMerge(clsx(
      "px-6 py-4 text-sm font-body text-slate-700",
      isNumeric && "font-mono font-medium tracking-tight text-slate-900",
      className
    ))}
    {...props}
  >
    {children}
  </td>
);
