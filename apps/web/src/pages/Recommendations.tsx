import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SavingsTicket } from '../components/ui/SavingsTicket';

// Mock Data
const mockRecommendations = [
  {
    id: 'rec-1',
    title: 'Terminate Idle RDS Database',
    resource: 'db-0idlerds01xyz (db.m5.xlarge)',
    rationale: 'This database instance has had 0 connections and <1% CPU utilization for the past 14 days.',
    savings: 360.00,
    confidence: 'High',
    type: 'Idle',
  },
  {
    id: 'rec-2',
    title: 'Delete Unattached EBS Volume',
    resource: 'vol-0unattached02 (io2 500GB)',
    rationale: 'Volume has been unattached for over 30 days.',
    savings: 125.00,
    confidence: 'High',
    type: 'Unused',
  },
  {
    id: 'rec-3',
    title: 'Right-size EC2 Instance',
    resource: 'i-0worker99 (c5.4xlarge → c5.xlarge)',
    rationale: 'Average CPU utilization is 8% over the last 30 days. Downsizing will meet performance needs.',
    savings: 480.00,
    confidence: 'Medium',
    type: 'Right-size',
  }
];

export const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [filter, setFilter] = useState('All');

  const handleApply = (id: string) => {
    setRecommendations(recommendations.filter(r => r.id !== id));
    alert('SIMULATED: Recommendation applied successfully.');
  };

  const handleDismiss = (id: string) => {
    setRecommendations(recommendations.filter(r => r.id !== id));
  };

  const filteredRecs = filter === 'All' ? recommendations : recommendations.filter(r => r.type === filter);
  const sortedRecs = [...filteredRecs].sort((a, b) => b.savings - a.savings);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-ink uppercase tracking-tight">Recommendations</h1>
          <p className="text-ink font-bold uppercase mt-2">Review and apply cost-saving opportunities.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 bg-surface border-2 border-ink p-1 shadow-brutal">
          {['All', 'Idle', 'Unused', 'Right-size'].map(type => (
            <Button 
              key={type}
              variant={filter === type ? 'primary' : 'ghost'} 
              size="sm"
              onClick={() => setFilter(type)}
              className={filter === type ? 'bg-ink text-surface' : ''}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {sortedRecs.length > 0 ? (
            sortedRecs.map(rec => (
              <Card key={rec.id} className="overflow-hidden hover:bg-surfaceMuted/50 transition-colors">
                <CardContent className="p-0">
                  <div className="p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-black text-xl text-ink uppercase tracking-tight">{rec.title}</h3>
                        <Badge variant={rec.confidence === 'High' ? 'savings' : 'warning'}>{rec.confidence} Confidence</Badge>
                      </div>
                      <div className="inline-block bg-surface border border-ink px-2 py-0.5">
                        <p className="text-xs font-mono font-bold text-ink">{rec.resource}</p>
                      </div>
                      <p className="text-sm font-bold text-ink leading-relaxed">{rec.rationale}</p>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-4 min-w-[140px] bg-surface border-2 border-ink p-4 shadow-brutal w-full md:w-auto">
                      <div className="text-3xl font-mono font-bold text-savings">${rec.savings.toFixed(2)}<span className="text-sm text-ink font-sans font-bold uppercase ml-1">/mo</span></div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="secondary" size="sm" onClick={() => handleDismiss(rec.id)} className="flex-1 md:flex-none">Dismiss</Button>
                        <Button variant="savings" size="sm" onClick={() => handleApply(rec.id)} className="flex-1 md:flex-none">Apply</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-xl font-bold uppercase">No recommendations found.</p>
                <p className="font-mono mt-2">Zero waste detected.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <SavingsTicket 
            title="Total Potential Savings"
            rationale="Applying all remaining high-confidence recommendations."
            estimatedSavings={recommendations.reduce((sum, r) => sum + r.savings, 0)}
            confidence="High"
          />
        </div>
      </div>
    </div>
  );
};
