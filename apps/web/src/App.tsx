import React, { useState } from 'react';
import { Button } from './components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './components/ui/Table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Landmark, Server, Shield, Smartphone, HardHat, TrendingUp, AlertTriangle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

// Mock chart data for Neubrutalist Cost Trend Chart
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

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recommendations' | 'resources'>('dashboard');

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] p-4 md:p-8 font-body max-w-7xl mx-auto selection:bg-warning selection:text-ink">
      
      {/* 1. Neubrutalist Navigation Bar */}
      <nav className="border-3 border-ink bg-white shadow-neobrutal p-4 mb-8 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-warning fill-warning" />
            CloudLens
          </span>
          <Badge variant="ink" size="sm" className="font-mono tracking-wider">HACKATHON v1.0</Badge>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'dashboard' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </Button>
          <Button 
            variant={activeTab === 'recommendations' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setActiveTab('recommendations')}
          >
            Recommendations
          </Button>
          <Button 
            variant={activeTab === 'resources' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setActiveTab('resources')}
          >
            Resource Explorer
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="warning" className="font-mono">Priya (FinOps Org)</Badge>
          <Button variant="secondary" size="sm" className="p-2">
            <RefreshCw className="w-4 h-4 animate-spin-hover" />
          </Button>
        </div>
      </nav>

      {/* 2. Headline Summary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">
        
        {/* Hero element: The Savings Ticket */}
        <Card variant="warning" tilt className="cursor-pointer select-none md:col-span-1 border-3 border-ink shadow-neobrutal-lg hover:rotate-0 transition-transform duration-200">
          <div className="border-dashed border-2 border-ink p-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] font-bold bg-ink text-white px-2 py-0.5 rounded">OPPORTUNITIES FOUND</span>
              <Badge variant="alert" size="sm">HIGH CONFIDENCE</Badge>
            </div>
            <h3 className="text-2xl font-display font-black uppercase mt-4 leading-none">
              Potential Savings
            </h3>
            <div className="text-5xl font-mono font-black mt-2 tracking-tighter">
              $3,770.43
            </div>
            <p className="text-[11px] text-ink mt-3 font-semibold font-mono">
              ★ 33 UNRESOLVED ISSUES IDENTIFIED ★
            </p>
            <div className="border-t-2 border-ink border-dashed mt-4 pt-3 flex justify-between items-center text-xs font-mono font-bold">
              <span>MOCKED ORG CONTEXT</span>
              <span className="underline">APPLY ALL NOW →</span>
            </div>
          </div>
        </Card>

        {/* Total Spend Metric */}
        <Card className="h-full flex flex-col justify-between">
          <div>
            <CardHeader className="pb-2 border-b-0 mb-0">
              <span className="font-mono text-xs text-textMuted uppercase font-bold tracking-wider">MONTHLY RUNRATE</span>
              <CardTitle className="text-3xl font-display font-black uppercase mt-1">Total Spend</CardTitle>
            </CardHeader>
            <CardContent className="mt-2">
              <div className="text-4xl font-mono font-bold tracking-tight">$7,088.01</div>
              <div className="flex items-center gap-1.5 text-alert font-bold mt-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+12.4% vs last month</span>
              </div>
            </CardContent>
          </div>
          <div className="px-6 pb-6 pt-2">
            <p className="text-xs text-textMuted font-mono">Based on trailing 30 days of actual cloud utilization data.</p>
          </div>
        </Card>

        {/* Resource Health Metric */}
        <Card className="h-full flex flex-col justify-between">
          <div>
            <CardHeader className="pb-2 border-b-0 mb-0">
              <span className="font-mono text-xs text-textMuted uppercase font-bold tracking-wider">INFRASTRUCTURE HEALTH</span>
              <CardTitle className="text-3xl font-display font-black uppercase mt-1">Active Assets</CardTitle>
            </CardHeader>
            <CardContent className="mt-2">
              <div className="text-4xl font-mono font-bold tracking-tight">50 Resources</div>
              <div className="flex items-center gap-1.5 text-savings font-bold mt-2 text-sm">
                <Shield className="w-4 h-4" />
                <span>17 optimized (34.0%)</span>
              </div>
            </CardContent>
          </div>
          <div className="px-6 pb-6 pt-2">
            <p className="text-xs text-textMuted font-mono">Average CPU: 24.3%, EBS Detached: 2, Idle IPs: 1</p>
          </div>
        </Card>
      </div>

      {/* 3. Primary Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Col Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Cost Trend Chart */}
          <Card>
            <CardHeader className="pb-4 mb-4 border-b-2 border-ink">
              <CardTitle className="text-2xl uppercase tracking-tight">Weekly Cost Trend (USD)</CardTitle>
              <CardDescription>Visualizing infrastructure cost growth over the last 12 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyCostData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0DB" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fill: '#0A0A0A', fontFamily: 'IBM Plex Mono', fontWeight: 'bold', fontSize: 11 }}
                      axisLine={{ stroke: '#0A0A0A', strokeWidth: 2 }}
                      tickLine={{ stroke: '#0A0A0A', strokeWidth: 2 }}
                    />
                    <YAxis 
                      tick={{ fill: '#0A0A0A', fontFamily: 'IBM Plex Mono', fontWeight: 'bold', fontSize: 11 }}
                      axisLine={{ stroke: '#0A0A0A', strokeWidth: 2 }}
                      tickLine={{ stroke: '#0A0A0A', strokeWidth: 2 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #0A0A0A',
                        boxShadow: '3px 3px 0px #0A0A0A',
                        fontFamily: 'IBM Plex Mono',
                        fontSize: '12px',
                        color: '#0A0A0A',
                        fontWeight: 'bold',
                      }}
                      cursor={{ fill: 'rgba(242, 183, 5, 0.15)' }}
                    />
                    <Bar 
                      dataKey="cost" 
                      fill="#1A73E8" 
                      stroke="#0A0A0A" 
                      strokeWidth={2}
                      // Neubrutalist bars shouldn't be rounded
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Recommendations Table */}
          <Card>
            <CardHeader className="pb-4 mb-4 border-b-2 border-ink flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl uppercase tracking-tight">Top Savings Actions</CardTitle>
                <CardDescription>Recommendations sorted by highest dollar savings impact</CardDescription>
              </div>
              <Button variant="secondary" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Opportunity / Resource</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Monthly Savings</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div className="font-bold">Terminate Idle RDS Database</div>
                        <div className="text-xs text-textMuted font-mono">db-0idlerds01xyz (db.m5.xlarge)</div>
                      </TableCell>
                      <TableCell><Badge variant="alert">Idle Compute</Badge></TableCell>
                      <TableCell isNumeric className="font-bold text-alert">$360.00</TableCell>
                      <TableCell><Badge variant="savings">High</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="savings" size="sm">Apply</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell>
                        <div className="font-bold">Delete Unattached EBS Volume</div>
                        <div className="text-xs text-textMuted font-mono">vol-0unattached02 (io2 500GB)</div>
                      </TableCell>
                      <TableCell><Badge variant="warning">Storage Waste</Badge></TableCell>
                      <TableCell isNumeric className="font-bold text-alert">$125.00</TableCell>
                      <TableCell><Badge variant="savings">High</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="savings" size="sm">Apply</Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <div className="font-bold">Downsize Over-provisioned EC2</div>
                        <div className="text-xs text-textMuted font-mono">i-0rightsize01ec2 (c5.4xlarge)</div>
                      </TableCell>
                      <TableCell><Badge variant="info">Rightsizing</Badge></TableCell>
                      <TableCell isNumeric className="font-bold text-alert">$458.20</TableCell>
                      <TableCell><Badge variant="warning">Medium</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="savings" size="sm">Apply</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Col Span 1) */}
        <div className="space-y-8">
          
          {/* Team efficiency Leaderboard */}
          <Card>
            <CardHeader className="pb-4 mb-4 border-b-2 border-ink">
              <CardTitle className="text-2xl uppercase tracking-tight">Team Leaderboard</CardTitle>
              <CardDescription>Ranking teams by spending waste efficiency index</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                
                {/* 1st Place: Security */}
                <div className="border-2 border-ink p-3 rounded bg-white flex items-center justify-between shadow-neobrutal-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base border-r-2 border-ink pr-3 text-savings">#1</span>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-savings" />
                        Security Team
                      </div>
                      <div className="text-xs text-textMuted font-mono">Spend: $120.50 · Budget: $4k</div>
                    </div>
                  </div>
                  <Badge variant="savings" className="font-mono">100.0% Eff</Badge>
                </div>

                {/* 2nd Place: Mobile */}
                <div className="border-2 border-ink p-3 rounded bg-white flex items-center justify-between shadow-neobrutal-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base border-r-2 border-ink pr-3 text-savings">#2</span>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-info" />
                        Mobile Team
                      </div>
                      <div className="text-xs text-textMuted font-mono">Spend: $450.20 · Budget: $6k</div>
                    </div>
                  </div>
                  <Badge variant="savings" className="font-mono">92.4% Eff</Badge>
                </div>

                {/* 3rd Place: Growth */}
                <div className="border-2 border-ink p-3 rounded bg-white flex items-center justify-between shadow-neobrutal-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base border-r-2 border-ink pr-3 text-warning">#3</span>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-warning" />
                        Growth Team
                      </div>
                      <div className="text-xs text-textMuted font-mono">Spend: $1,250.00 · Budget: $9k</div>
                    </div>
                  </div>
                  <Badge variant="warning" className="font-mono">81.2% Eff</Badge>
                </div>

                {/* 4th Place: Platform */}
                <div className="border-2 border-ink p-3 rounded bg-white flex items-center justify-between shadow-neobrutal-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base border-r-2 border-ink pr-3 text-alert">#4</span>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <HardHat className="w-3.5 h-3.5 text-ink" />
                        Platform Team
                      </div>
                      <div className="text-xs text-textMuted font-mono">Spend: $2,840.10 · Budget: $18k</div>
                    </div>
                  </div>
                  <Badge variant="alert" className="font-mono">68.5% Eff</Badge>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Quick Info Box / Action Item */}
          <Card variant="muted" className="border-2 border-ink shadow-neobrutal">
            <CardHeader className="pb-2 border-b-0 mb-0">
              <div className="flex items-center gap-2 text-alert">
                <AlertTriangle className="w-5 h-5 fill-alert text-white" />
                <CardTitle className="text-lg uppercase tracking-tight text-ink">Action Required</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-ink leading-relaxed">
                Platform Team is currently exceeding efficiency thresholds by <strong>11.5%</strong>. This month's budget overshoot is driven by 2 unattached volumes and an idle database replica.
              </p>
              <div className="mt-4">
                <Button variant="primary" size="sm" className="w-full">
                  Notify Platform Team Leader
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

export default App;
