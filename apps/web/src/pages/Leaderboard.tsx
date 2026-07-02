import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Shield, HardHat, Database, Zap } from 'lucide-react';

const teamData = [
  { id: 't-1', name: 'Security', icon: Shield, spend: 120.50, efficiency: 100, color: 'text-savings', bg: 'bg-surface' },
  { id: 't-2', name: 'Engineering', icon: Zap, spend: 3250.00, efficiency: 85, color: 'text-info', bg: 'bg-surface' },
  { id: 't-3', name: 'Platform', icon: HardHat, spend: 2840.10, efficiency: 68.5, color: 'text-warning', bg: 'bg-surface' },
  { id: 't-4', name: 'Data', icon: Database, spend: 1875.40, efficiency: 45, color: 'text-alert', bg: 'bg-surface' },
];

export const Leaderboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-black text-ink uppercase tracking-tight">Team Leaderboard</h1>
        <p className="text-ink font-bold uppercase mt-2">Ranking teams by infrastructure efficiency and spending waste.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4 mb-4 border-b-2 border-ink">
            <CardTitle className="text-xl uppercase">Efficiency Rankings</CardTitle>
            <CardDescription className="text-ink font-bold uppercase mt-1">Chargeback framing based on resource utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamData.sort((a, b) => b.efficiency - a.efficiency).map((team, idx) => (
                <div key={team.id} className={`p-5 bg-surface border-2 border-ink flex items-center justify-between transition-colors shadow-brutal-hover hover:bg-surfaceMuted`}>
                  <div className="flex items-center gap-4">
                    <span className={`font-display font-black text-2xl w-6 ${team.color}`}>{idx + 1}</span>
                    <div>
                      <div className="font-bold text-base uppercase flex items-center gap-2 text-ink">
                        <team.icon className={`w-5 h-5 stroke-[3px] ${team.color}`} />
                        {team.name}
                      </div>
                      <div className="text-xs font-mono font-bold mt-1 bg-surfaceMuted px-1 border border-ink w-fit">Total Spend: ${team.spend.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-ink uppercase tracking-wider">Efficiency</span>
                    <Badge variant={team.efficiency >= 80 ? 'savings' : (team.efficiency > 50 ? 'warning' : 'alert')} size="md" className="shadow-brutal-hover">
                      {team.efficiency}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
