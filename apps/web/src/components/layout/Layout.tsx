import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Landmark, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen text-ink p-4 md:p-8 font-body max-w-7xl mx-auto selection:bg-info selection:text-white">
      
      {/* Navigation Bar */}
      <nav className="bg-surface sticky top-4 z-50 p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-[3px] border-ink shadow-brutal transition-all">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-black tracking-tight flex items-center gap-2 uppercase">
            <div className="w-8 h-8 bg-ink flex items-center justify-center">
              <Landmark className="w-5 h-5 text-surface" />
            </div>
            CloudLens
          </span>
          <Badge variant="ink" size="sm" className="font-mono tracking-wider opacity-80">v1.0</Badge>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-1.5 p-1 bg-surfaceMuted border-2 border-ink shadow-brutal-hover">
          <NavLink to="/">
            {({ isActive }) => (
              <Button variant={isActive ? 'primary' : 'ghost'} size="sm">Dashboard</Button>
            )}
          </NavLink>
          <NavLink to="/recommendations">
            {({ isActive }) => (
              <Button variant={isActive ? 'primary' : 'ghost'} size="sm">Recommendations</Button>
            )}
          </NavLink>
          <NavLink to="/resources">
            {({ isActive }) => (
              <Button variant={isActive ? 'primary' : 'ghost'} size="sm">Resources</Button>
            )}
          </NavLink>
          <NavLink to="/teams">
            {({ isActive }) => (
              <Button variant={isActive ? 'primary' : 'ghost'} size="sm">Leaderboard</Button>
            )}
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="warning" className="font-mono text-xs shadow-brutal-hover">Priya (FinOps)</Badge>
          <Button variant="secondary" size="sm" className="p-2 w-9 h-9" isPill={false}>
            <RefreshCw className="w-4 h-4 text-ink" />
          </Button>
        </div>
      </nav>

      <main className="animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};
