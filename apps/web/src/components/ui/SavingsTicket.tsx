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
    <Card className="bg-white border border-border shadow-md h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <Badge variant="primary">Action Required</Badge>
          <Badge variant={confidence === 'High' ? 'savings' : 'primary'}>
            {confidence} Confidence
          </Badge>
        </div>
        <CardTitle className="text-text mt-4 text-xl font-semibold tracking-tight leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <p className="text-textMuted text-sm mb-6 leading-snug">{rationale}</p>
        <div className="mt-auto bg-slate-50 border border-slate-100 rounded-lg p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-textMuted mb-1">Potential Savings</div>
          <div className="text-4xl font-mono font-bold tracking-tight text-savings">
            ${estimatedSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
