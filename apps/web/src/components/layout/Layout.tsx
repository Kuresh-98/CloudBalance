import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Landmark, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* Navigation Bar */}
      <nav className="bg-white sticky top-0 z-50 px-4 md:px-8 py-3 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg tracking-tight flex items-center gap-2 text-text">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm text-white">
              <Landmark className="w-5 h-5" />
            </div>
            CloudLens
          </span>
          <Badge variant="outline" size="sm" className="font-mono text-textMuted tracking-wider bg-slate-50">v1.0</Badge>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100/50 rounded-lg border border-slate-200">
          <NavLink to="/">
            {({ isActive }) => (
              <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" className={isActive ? 'bg-white shadow-sm' : ''}>Dashboard</Button>
            )}
          </NavLink>
          <NavLink to="/recommendations">
            {({ isActive }) => (
              <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" className={isActive ? 'bg-white shadow-sm' : ''}>Recommendations</Button>
            )}
          </NavLink>
          <NavLink to="/resources">
            {({ isActive }) => (
              <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" className={isActive ? 'bg-white shadow-sm' : ''}>Resources</Button>
            )}
          </NavLink>
          <NavLink to="/teams">
            {({ isActive }) => (
              <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" className={isActive ? 'bg-white shadow-sm' : ''}>Leaderboard</Button>
            )}
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="primary" className="font-medium text-xs">Priya (FinOps)</Badge>
          <Button variant="ghost" size="sm" className="p-2 w-9 h-9 text-textMuted hover:text-text">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-12 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};
