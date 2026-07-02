import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import { Search } from 'lucide-react';

const mockResources = [
  { id: 'res-1', name: 'db-0idlerds01xyz', service: 'RDS', team: 'Platform', status: 'Idle', cost: 360.00, utilization: '< 1%' },
  { id: 'res-2', name: 'api-gateway-prod', service: 'API Gateway', team: 'Engineering', status: 'Active', cost: 1250.50, utilization: '68%' },
  { id: 'res-3', name: 'vol-0unattached02', service: 'EBS', team: 'Platform', status: 'Unattached', cost: 125.00, utilization: '0%' },
  { id: 'res-4', name: 'i-0worker99', service: 'EC2', team: 'Data', status: 'Underutilized', cost: 480.00, utilization: '8%' },
  { id: 'res-5', name: 'cache-cluster-01', service: 'ElastiCache', team: 'Engineering', status: 'Active', cost: 840.20, utilization: '45%' },
];

export const Resources: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredResources = mockResources.filter(res => 
    res.name.toLowerCase().includes(search.toLowerCase()) || 
    res.service.toLowerCase().includes(search.toLowerCase()) ||
    res.team.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-black text-ink uppercase tracking-tight">Resource Explorer</h1>
        <p className="text-ink font-bold uppercase mt-2">Search and filter cloud resources across teams.</p>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b-2 border-ink bg-surfaceMuted">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="text-xl uppercase">Active Resources</CardTitle>
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-3 text-ink stroke-[3px]" />
              <input 
                type="text"
                placeholder="SEARCH RESOURCES..."
                className="pl-10 pr-3 py-2 border-2 border-ink shadow-brutal focus:outline-none focus:shadow-brutal-hover font-mono text-sm uppercase placeholder:text-ink/50 bg-surface text-ink transition-shadow w-full sm:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <TableContainer className="border-0 shadow-none rounded-none border-b-2 border-ink last:border-b-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource Name</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead className="text-right">Monthly Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map(res => (
                  <TableRow key={res.id} className="cursor-pointer">
                    <TableCell className="font-mono text-sm text-ink font-bold">{res.name}</TableCell>
                    <TableCell className="font-bold">{res.service}</TableCell>
                    <TableCell className="font-bold">{res.team}</TableCell>
                    <TableCell>
                      <Badge variant={res.status === 'Active' ? 'info' : (res.status === 'Idle' || res.status === 'Unattached' ? 'warning' : 'ink')}>
                        {res.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{res.utilization}</TableCell>
                    <TableCell isNumeric className="font-bold text-lg text-ink">${res.cost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};
