import React from 'react';
import { clsx } from 'clsx';

export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={clsx("border-2 border-ink shadow-neobrutal rounded-md overflow-hidden bg-white w-full", className)} {...props}>
    <div className="overflow-x-auto">
      {children}
    </div>
  </div>
);

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ children, className, ...props }) => (
  <table className={clsx("w-full text-left border-collapse", className)} {...props}>
    {children}
  </table>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <thead className={clsx("bg-white border-b-2 border-ink select-none", className)} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <tbody className={clsx("divide-y-2 divide-ink", className)} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className, ...props }) => (
  <tr className={clsx("even:bg-[#FAFAF7] hover:bg-neutral-50 transition-colors", className)} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <th className={clsx("px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink border-r-2 border-ink last:border-r-0", className)} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className, isNumeric = false, ...props }) => (
  <td
    className={clsx(
      "px-6 py-4 text-sm border-r-2 border-ink last:border-r-0 font-body text-ink",
      isNumeric && "font-mono font-medium tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </td>
);
