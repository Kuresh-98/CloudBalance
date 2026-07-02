import React, { useState } from 'react';
import { Button } from './components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { SavingsTicket } from './components/ui/SavingsTicket';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './components/ui/Table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Landmark, Server, Shield, Smartphone, HardHat, TrendingUp, AlertTriangle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

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

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recommendations' | 'resources' | 'components'>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-body max-w-7xl mx-auto selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Modern Premium Navigation Bar */}
      <nav className="glass sticky top-4 z-50 p-4 mb-8 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 transition-all shadow-premium">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-inner">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            CloudLens
          </span>
          <Badge variant="ink" size="sm" className="font-mono tracking-wider opacity-80">v1.0</Badge>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
          <Button 
            variant={activeTab === 'dashboard' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </Button>
          <Button 
            variant={activeTab === 'recommendations' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('recommendations')}
          >
            Recommendations
          </Button>
          <Button 
            variant={activeTab === 'resources' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </Button>
          <Button 
            variant={activeTab === 'components' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('components')}
          >
            Showcase
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="warning" className="font-mono text-xs">Priya (FinOps)</Badge>
          <Button variant="secondary" size="sm" className="p-2 w-9 h-9 rounded-full">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <main className="animate-fade-in">
        {activeTab === 'components' && (
          <div className="space-y-12 max-w-4xl mx-auto animate-slide-up">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">Premium UI Showcase</h2>
              <p className="text-slate-500 mt-3 text-lg">A modern, efficient design system built with Tailwind CSS.</p>
            </div>
            
            <section className="space-y-6">
              <h3 className="text-2xl font-bold border-b border-slate-200 pb-3 text-slate-800">Buttons</h3>
              <div className="flex flex-wrap gap-4 p-8 glass rounded-2xl">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="savings">Save $45</Button>
                <Button variant="alert">Delete</Button>
                <Button variant="warning">Review</Button>
                <Button variant="info">Details</Button>
                <Button variant="primary" isPill>Pill Shape</Button>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-2xl font-bold border-b border-slate-200 pb-3 text-slate-800">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Standard Card</CardTitle>
                    <CardDescription>Clean layout with soft shadows</CardDescription>
                  </CardHeader>
                  <CardContent>
                    Content goes here. It is highly readable and minimal.
                  </CardContent>
                </Card>
                <Card variant="glass" className="bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-white">Glass Card</CardTitle>
                    <CardDescription className="text-slate-300">Premium dark mode look</CardDescription>
                  </CardHeader>
                  <CardContent className="text-slate-300">
                    Perfect for highlighting important metrics or saving opportunities.
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-2xl font-bold border-b border-slate-200 pb-3 text-slate-800">Savings Ticket</h3>
              <div className="max-w-3xl">
                <SavingsTicket 
                  title="Terminate Idle RDS Database"
                  rationale="This database instance (db-0idlerds01xyz) has had 0 connections and <1% CPU utilization for the past 14 days."
                  estimatedSavings={360.00}
                  confidence="High"
                />
              </div>
            </section>
          </div>
        )}

        {activeTab !== 'components' && (
          <div className="animate-slide-up space-y-8">
            {/* 2. Headline Summary Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              <div className="md:col-span-1 h-full">
                <SavingsTicket 
                  title="Idle RDS Database"
                  rationale="Found 33 unresolved issues including idle databases and unattached volumes."
                  estimatedSavings={3770.43}
                  confidence="High"
                />
              </div>

              <Card className="h-full flex flex-col justify-between group">
                <div>
                  <CardHeader className="pb-2 border-b-0 mb-0">
                    <span className="font-mono text-[10px] text-slate-400 uppercase font-bold tracking-widest">Monthly Runrate</span>
                    <CardTitle className="text-2xl font-display mt-1 text-slate-800">Total Spend</CardTitle>
                  </CardHeader>
                  <CardContent className="mt-2">
                    <div className="text-4xl font-mono font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">$7,088.01</div>
                    <div className="flex items-center gap-1.5 text-alert font-medium mt-3 text-sm bg-red-50 w-fit px-2.5 py-1 rounded-full">
                      <TrendingUp className="w-4 h-4" />
                      <span>+12.4% vs last month</span>
                    </div>
                  </CardContent>
                </div>
              </Card>

              <Card className="h-full flex flex-col justify-between group">
                <div>
                  <CardHeader className="pb-2 border-b-0 mb-0">
                    <span className="font-mono text-[10px] text-slate-400 uppercase font-bold tracking-widest">Infrastructure</span>
                    <CardTitle className="text-2xl font-display mt-1 text-slate-800">Active Assets</CardTitle>
                  </CardHeader>
                  <CardContent className="mt-2">
                    <div className="text-4xl font-mono font-bold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">50 Units</div>
                    <div className="flex items-center gap-1.5 text-savings font-medium mt-3 text-sm bg-emerald-50 w-fit px-2.5 py-1 rounded-full">
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
                  <CardHeader className="pb-4 mb-4 flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                      <CardTitle className="text-xl">Weekly Cost Trend</CardTitle>
                      <CardDescription>Infrastructure cost growth over 12 weeks</CardDescription>
                    </div>
                    <Badge variant="info" className="w-fit mt-2 sm:mt-0">Trailing 90 Days</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72 w-full mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyCostData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="week" 
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '12px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                              fontSize: '13px',
                              fontWeight: '600',
                            }}
                            cursor={{ fill: '#f8fafc' }}
                          />
                          <Bar 
                            dataKey="cost" 
                            fill="#3b82f6" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-4 mb-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Top Savings Actions</CardTitle>
                      <CardDescription>Highest dollar impact recommendations</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
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
                              <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Terminate Idle RDS Database</div>
                              <div className="text-xs text-slate-500 font-mono mt-1">db-0idlerds01xyz (db.m5.xlarge)</div>
                            </TableCell>
                            <TableCell isNumeric className="font-bold text-emerald-600">$360.00</TableCell>
                            <TableCell className="text-right">
                              <Button variant="savings" size="sm" className="shadow-none">Apply</Button>
                            </TableCell>
                          </TableRow>
                          
                          <TableRow className="group">
                            <TableCell>
                              <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Delete Unattached EBS Volume</div>
                              <div className="text-xs text-slate-500 font-mono mt-1">vol-0unattached02 (io2 500GB)</div>
                            </TableCell>
                            <TableCell isNumeric className="font-bold text-emerald-600">$125.00</TableCell>
                            <TableCell className="text-right">
                              <Button variant="savings" size="sm" className="shadow-none">Apply</Button>
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
                  <CardHeader className="pb-4 mb-4">
                    <CardTitle className="text-xl">Team Efficiency</CardTitle>
                    <CardDescription>Ranking teams by spending waste</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-500 w-5">1</span>
                          <div>
                            <div className="font-semibold text-sm flex items-center gap-2 text-slate-800">
                              <Shield className="w-4 h-4 text-emerald-500" />
                              Security
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">Spend: $120.50</div>
                          </div>
                        </div>
                        <Badge variant="savings" size="sm" className="bg-emerald-100 text-emerald-700 border-none">100%</Badge>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:border-amber-200 hover:bg-amber-50/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-amber-500 w-5">2</span>
                          <div>
                            <div className="font-semibold text-sm flex items-center gap-2 text-slate-800">
                              <HardHat className="w-4 h-4 text-amber-500" />
                              Platform
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">Spend: $2,840.10</div>
                          </div>
                        </div>
                        <Badge variant="warning" size="sm" className="bg-amber-100 text-amber-700 border-none">68.5%</Badge>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
