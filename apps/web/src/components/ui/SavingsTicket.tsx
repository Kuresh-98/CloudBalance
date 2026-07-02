import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';

interface SavingsTicketProps {
  title: string;
  rationale: string;
  estimatedSavings: number;
  confidence: 'High' | 'Medium' | 'Low';
}

export const SavingsTicket: React.FC<SavingsTicketProps> = ({
  title,
  rationale,
  estimatedSavings,
  confidence
}) => {
  return (
    <Card className="bg-warning border-ink border-[3px] shadow-brutal transform -rotate-2 hover:-rotate-1 hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-hover transition-all h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <Badge variant="ink" className="text-warning">Action Required</Badge>
          <Badge variant={confidence === 'High' ? 'savings' : 'ink'}>
            {confidence} Confidence
          </Badge>
        </div>
        <CardTitle className="text-ink mt-4 text-2xl uppercase tracking-tighter leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-ink/80 text-sm font-medium mb-6 leading-snug">{rationale}</p>
        <div className="bg-surface border-2 border-ink p-4 mt-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-textMuted mb-1">Potential Savings</div>
          <div className="text-5xl font-mono font-bold tracking-tighter text-savings">${estimatedSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </CardContent>
    </Card>
  );
};
