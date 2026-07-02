import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SavingsTicketProps {
  title: string;
  rationale: string;
  estimatedSavings: number;
  confidence?: 'High' | 'Medium' | 'Low';
  onApply?: () => void;
  status?: string;
}

export const SavingsTicket: React.FC<SavingsTicketProps> = ({
  title,
  rationale,
  estimatedSavings,
  confidence = 'High',
  onApply,
  status = 'open'
}) => {
  return (
    <Card variant="glass" className="relative overflow-hidden flex flex-col md:flex-row group transition-all duration-300">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-savings to-savings-hover"></div>
      
      <div className="pl-6 flex-1 flex flex-col justify-between z-10">
        <div>
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-savings" />
              {title}
            </h3>
            <span className="bg-white/10 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20">
              {confidence} Confidence
            </span>
          </div>
          <p className="text-slate-300 font-body text-sm leading-relaxed mb-4 md:mb-0 max-w-xl">
            {rationale}
          </p>
        </div>
      </div>
      
      <div className="md:ml-6 md:pl-6 md:border-l md:border-slate-700/50 flex flex-col items-center justify-center min-w-[160px] z-10">
        <div className="text-center mb-4">
          <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Savings</span>
          <span className="font-display text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-savings to-emerald-300">
            ${estimatedSavings.toFixed(2)}<span className="text-xl text-emerald-500/70 font-normal">/mo</span>
          </span>
        </div>
        <Button variant="savings" onClick={onApply} disabled={status !== 'open'} className="w-full gap-2 group-hover:shadow-premium-hover">
          {status === 'open' ? 'Apply Now' : 'Applied'}
          {status === 'open' && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
      
      {/* Decorative background glow */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-savings/20 rounded-full blur-3xl group-hover:bg-savings/30 transition-all duration-500 pointer-events-none"></div>
    </Card>
  );
};
