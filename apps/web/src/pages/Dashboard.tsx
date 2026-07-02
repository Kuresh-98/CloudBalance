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

const PremiumTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 shadow-lg rounded-lg">
        <p className="font-medium text-slate-500 text-sm mb-1">{label}</p>
        <p className="font-mono text-primary font-bold text-lg">${payload[0].value.toFixed(2)}</p>
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
        
        <div className="md:col-span-1 h-full pt-1">
          <SavingsTicket 
            title="Idle RDS Database"
            rationale="Found 33 unresolved issues including idle databases and unattached volumes."
            estimatedSavings={3770.43}
            confidence="High"
          />
        </div>

        <Card className="h-full flex flex-col justify-between group">
          <div>
            <CardHeader className="pb-2">
              <span className="text-xs text-primary font-semibold tracking-wider uppercase mb-1">Monthly Runrate</span>
              <CardTitle className="text-2xl text-text">Total Spend</CardTitle>
            </CardHeader>
            <CardContent className="mt-2">
              <div className="text-4xl font-mono font-bold tracking-tight text-text">$7,088.01</div>
              <div className="flex items-center gap-1.5 text-alert font-medium mt-4 text-sm bg-red-50 rounded-full w-fit px-3 py-1 border border-red-100">
                <TrendingUp className="w-4 h-4" />
                <span>+12.4% vs last month</span>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="h-full flex flex-col justify-between group">
          <div>
            <CardHeader className="pb-2">
              <span className="text-xs text-savings font-semibold tracking-wider uppercase mb-1">Infrastructure</span>
              <CardTitle className="text-2xl text-text">Active Assets</CardTitle>
            </CardHeader>
            <CardContent className="mt-2">
              <div className="text-4xl font-mono font-bold tracking-tight text-text">50 Units</div>
              <div className="flex items-center gap-1.5 text-savings font-medium mt-4 text-sm bg-emerald-50 rounded-full w-fit px-3 py-1 border border-emerald-100">
                <Shield className="w-4 h-4" />
                <span>17 optimized (34%)</span>
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
            <CardHeader className="pb-4 mb-4 flex flex-col sm:flex-row justify-between sm:items-center border-b border-border">
              <div>
                <CardTitle className="text-xl">Weekly Cost Trend</CardTitle>
                <CardDescription className="mt-1">Infrastructure cost growth over 12 weeks</CardDescription>
              </div>
              <Badge variant="outline" className="w-fit mt-2 sm:mt-0 font-medium">Trailing 90 Days</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyCostData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      axisLine={{ stroke: '#E2E8F0' }}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value}`}
                      dx={-10}
                    />
                    <Tooltip content={<PremiumTooltip />} cursor={{ fill: '#F8FAFC' }} />
                    <Bar 
                      dataKey="cost" 
                      fill="#2563EB" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 mb-4 flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="text-xl">Top Savings Actions</CardTitle>
                <CardDescription className="mt-1">Highest dollar impact recommendations</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary-hover">
                View All <ArrowRight className="w-4 h-4 ml-1" />
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
                        <div className="font-semibold text-text group-hover:text-primary transition-colors">Terminate Idle RDS Database</div>
                        <div className="text-xs font-mono text-textMuted mt-1">db-0idlerds01xyz (db.m5.xlarge)</div>
                      </TableCell>
                      <TableCell isNumeric className="font-semibold text-savings text-base">$360.00</TableCell>
                      <TableCell className="text-right">
                        <Button variant="savings" size="sm">Apply</Button>
                      </TableCell>
                    </TableRow>
                    
                    <TableRow className="group">
                      <TableCell>
                        <div className="font-semibold text-text group-hover:text-primary transition-colors">Delete Unattached EBS Volume</div>
                        <div className="text-xs font-mono text-textMuted mt-1">vol-0unattached02 (io2 500GB)</div>
                      </TableCell>
                      <TableCell isNumeric className="font-semibold text-savings text-base">$125.00</TableCell>
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
            <CardHeader className="pb-4 mb-4 border-b border-border">
              <CardTitle className="text-xl">Team Efficiency</CardTitle>
              <CardDescription className="mt-1">Ranking teams by spending waste</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                
                <div className="p-4 bg-white border border-border rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg text-slate-400 w-4">1</span>
                    <div>
                      <div className="font-semibold text-sm text-text flex items-center gap-2">
                        <Shield className="w-4 h-4 text-savings" />
                        Security
                      </div>
                      <div className="text-xs font-mono text-textMuted mt-1">Spend: $120.50</div>
                    </div>
                  </div>
                  <Badge variant="savings" size="sm">100%</Badge>
                </div>

                <div className="p-4 bg-white border border-border rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg text-slate-400 w-4">2</span>
                    <div>
                      <div className="font-semibold text-sm text-text flex items-center gap-2">
                        <HardHat className="w-4 h-4 text-warning" />
                        Platform
                      </div>
                      <div className="text-xs font-mono text-textMuted mt-1">Spend: $2,840.10</div>
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
