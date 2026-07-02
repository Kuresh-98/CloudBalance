import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SavingsTicket } from '../components/ui/SavingsTicket';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Shield, HardHat, TrendingUp, ArrowRight } from 'lucide-react';

// Mock chart data for Cost Trend Chart
const weeklyCostData = [
  { week: 'W1', cost: 420 },
  { week: 'W2', cost: 450 },
  { week: 'W3', cost: 410 },
  { week: 'W4', cost: 480 },
  { week: 'W5', cost: 510 },
  { week: 'W6', cost: 490 },
  { week: 'W7', cost: 530 },
  { week: 'W8', cost: 580 },
  { week: 'W9', cost: 620 },
  { week: 'W10', cost: 680 },
  { week: 'W11', cost: 710 },
  { week: 'W12', cost: 720 },
];

const BrutalTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border-2 border-ink p-3 shadow-brutal">
        <p className="font-bold text-ink uppercase mb-1">{label}</p>
        <p className="font-mono text-info font-bold">${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* 2. Headline Summary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        <div className="md:col-span-1 h-full pt-4">
          <SavingsTicket 
            title="Idle RDS Database"
            rationale="Found 33 unresolved issues including idle databases and unattached volumes."
            estimatedSavings={3770.43}
            confidence="High"
          />
        </div>

        <Card className="h-full flex flex-col justify-between group bg-surface">
          <div>
            <CardHeader className="pb-2 border-b-0 mb-0">
              <span className="font-mono text-[10px] text-ink uppercase font-bold tracking-widest bg-info text-white px-2 py-1 w-fit border-2 border-ink">Monthly Runrate</span>
              <CardTitle className="text-3xl font-display mt-2 text-ink uppercase">Total Spend</CardTitle>
            </CardHeader>
            <CardContent className="mt-2">
              <div className="text-5xl font-mono font-bold tracking-tight text-ink group-hover:text-info transition-colors">$7,088.01</div>
              <div className="flex items-center gap-1.5 text-alert font-bold mt-4 text-sm bg-surface border-2 border-ink w-fit px-2.5 py-1 shadow-brutal-hover">
                <TrendingUp className="w-5 h-5 stroke-[3px]" />
                <span className="uppercase tracking-wider">+12.4% vs last month</span>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="h-full flex flex-col justify-between group bg-surface">
          <div>
            <CardHeader className="pb-2 border-b-0 mb-0">
              <span className="font-mono text-[10px] text-ink uppercase font-bold tracking-widest bg-savings text-white px-2 py-1 w-fit border-2 border-ink">Infrastructure</span>
              <CardTitle className="text-3xl font-display mt-2 text-ink uppercase">Active Assets</CardTitle>
            </CardHeader>
            <CardContent className="mt-2">
              <div className="text-5xl font-mono font-bold tracking-tight text-ink group-hover:text-savings transition-colors">50 Units</div>
              <div className="flex items-center gap-1.5 text-savings font-bold mt-4 text-sm bg-surface border-2 border-ink w-fit px-2.5 py-1 shadow-brutal-hover">
                <Shield className="w-5 h-5 stroke-[3px]" />
                <span className="uppercase tracking-wider">17 optimized (34%)</span>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* 3. Primary Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="pb-4 mb-4 flex flex-col sm:flex-row justify-between sm:items-center border-b-2 border-ink">
              <div>
                <CardTitle className="text-xl uppercase">Weekly Cost Trend</CardTitle>
                <CardDescription className="text-ink font-bold uppercase mt-1">Infrastructure cost growth over 12 weeks</CardDescription>
              </div>
              <Badge variant="ink" className="w-fit mt-2 sm:mt-0">Trailing 90 Days</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyCostData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#0A0A0A" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fill: '#0A0A0A', fontSize: 12, fontWeight: 'bold' }}
                      axisLine={{ stroke: '#0A0A0A', strokeWidth: 2 }}
                      tickLine={{ stroke: '#0A0A0A', strokeWidth: 2 }}
                    />
                    <YAxis 
                      tick={{ fill: '#0A0A0A', fontSize: 12, fontWeight: 'bold' }}
                      axisLine={{ stroke: '#0A0A0A', strokeWidth: 2 }}
                      tickLine={{ stroke: '#0A0A0A', strokeWidth: 2 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<BrutalTooltip />} cursor={{ fill: '#FAFAF7', stroke: '#0A0A0A', strokeWidth: 2 }} />
                    <Bar 
                      dataKey="cost" 
                      fill="#1A73E8" 
                      stroke="#0A0A0A"
                      strokeWidth={2}
                      radius={[0, 0, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 mb-4 flex flex-row items-center justify-between border-b-2 border-ink">
              <div>
                <CardTitle className="text-xl uppercase">Top Savings Actions</CardTitle>
                <CardDescription className="text-ink font-bold uppercase mt-1">Highest dollar impact recommendations</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-info border-none">
                View All <ArrowRight className="w-5 h-5 ml-1 stroke-[3px]" />
              </Button>
            </CardHeader>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Opportunity / Resource</TableHead>
                      <TableHead>Monthly Savings</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="group">
                      <TableCell>
                        <div className="font-bold text-ink uppercase group-hover:text-info transition-colors">Terminate Idle RDS Database</div>
                        <div className="text-xs font-mono font-bold mt-1 bg-surfaceMuted w-fit px-1 border border-ink">db-0idlerds01xyz (db.m5.xlarge)</div>
                      </TableCell>
                      <TableCell isNumeric className="font-bold text-savings text-lg">$360.00</TableCell>
                      <TableCell className="text-right">
                        <Button variant="savings" size="sm">Apply</Button>
                      </TableCell>
                    </TableRow>
                    
                    <TableRow className="group">
                      <TableCell>
                        <div className="font-bold text-ink uppercase group-hover:text-info transition-colors">Delete Unattached EBS Volume</div>
                        <div className="text-xs font-mono font-bold mt-1 bg-surfaceMuted w-fit px-1 border border-ink">vol-0unattached02 (io2 500GB)</div>
                      </TableCell>
                      <TableCell isNumeric className="font-bold text-savings text-lg">$125.00</TableCell>
                      <TableCell className="text-right">
                        <Button variant="savings" size="sm">Apply</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <Card>
            <CardHeader className="pb-4 mb-4 border-b-2 border-ink">
              <CardTitle className="text-xl uppercase">Team Efficiency</CardTitle>
              <CardDescription className="text-ink font-bold uppercase mt-1">Ranking teams by spending waste</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                
                <div className="p-4 bg-surface border-2 border-ink flex items-center justify-between hover:bg-surfaceMuted transition-colors shadow-brutal-hover">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-black text-xl text-savings w-6">1</span>
                    <div>
                      <div className="font-bold text-base uppercase flex items-center gap-2 text-ink">
                        <Shield className="w-5 h-5 text-savings stroke-[3px]" />
                        Security
                      </div>
                      <div className="text-xs font-mono font-bold mt-1 bg-surfaceMuted px-1 border border-ink w-fit">Spend: $120.50</div>
                    </div>
                  </div>
                  <Badge variant="savings" size="sm">100%</Badge>
                </div>

                <div className="p-4 bg-surface border-2 border-ink flex items-center justify-between hover:bg-surfaceMuted transition-colors shadow-brutal-hover">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-black text-xl text-warning w-6">2</span>
                    <div>
                      <div className="font-bold text-base uppercase flex items-center gap-2 text-ink">
                        <HardHat className="w-5 h-5 text-warning stroke-[3px]" />
                        Platform
                      </div>
                      <div className="text-xs font-mono font-bold mt-1 bg-surfaceMuted px-1 border border-ink w-fit">Spend: $2,840.10</div>
                    </div>
                  </div>
                  <Badge variant="warning" size="sm">68.5%</Badge>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
