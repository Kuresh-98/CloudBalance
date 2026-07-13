import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  Landmark, 
  RefreshCw, 
  LayoutDashboard, 
  Lightbulb, 
  Server, 
  Trophy, 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { path: "/resources", label: "Resources", icon: Server },
  { path: "/teams", label: "Leaderboard", icon: Trophy },
];
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { useAppState } from "../../lib/appState";
import { useAuth } from "../../lib/AuthContext";

export const Layout: React.FC = () => {
  const { role, setRole, activeTeamId, setActiveTeamId, teams, refreshTeams } =
    useAppState();
  const { user, logout } = useAuth();
  
  const location = useLocation();
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-text font-sans selection:bg-primary/20 selection:text-primary">
      {/* Sidebar Navigation */}
      <aside 
        className={`sticky top-0 h-screen flex flex-col border-r border-border bg-white shadow-sm flex-shrink-0 z-50 transition-all duration-300 ease-in-out ${isMinimized ? 'w-20' : 'w-64'}`}
      >
        <div className={`flex items-center p-4 border-b border-border mb-4 relative`}>
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <Landmark className="h-4 w-4" />
          </span>
          <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'w-0 opacity-0 ml-0' : 'w-full opacity-100 ml-3'}`}>
            <div className="font-semibold tracking-tight text-text whitespace-nowrap">
              CloudBalance
            </div>
            <Badge
              variant="outline"
              size="sm"
              className="mt-1 bg-slate-50 font-mono tracking-wider text-textMuted w-fit"
            >
              v1.0
            </Badge>
          </div>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white text-textMuted shadow-sm hover:text-text hover:bg-slate-50 focus:outline-none z-10"
            title={isMinimized ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isMinimized ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex flex-col flex-1 px-4 gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={isMinimized ? item.label : undefined}
                className={`flex items-center h-10 text-sm rounded-md transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:text-primary focus:outline-none overflow-hidden ${
                  location.pathname === item.path ? 'bg-slate-50 font-medium text-primary' : 'text-text'
                } ${isMinimized ? 'px-0 justify-center' : 'px-3'}`}
              >
                <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`whitespace-nowrap transition-all duration-300 ${isMinimized ? 'w-0 opacity-0 ml-0' : 'opacity-100 ml-3'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <header className="sticky top-0 z-40 flex items-center justify-end gap-4 border-b border-border bg-white px-4 py-3 shadow-sm md:px-8">
          <div className="flex items-center gap-4">
            <select
              className="min-w-[140px] rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              value={role}
              onChange={(event) => setRole(event.target.value as "viewer" | "admin")}
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>

            <select
              className="min-w-[180px] rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              value={activeTeamId}
              onChange={(event) => setActiveTeamId(event.target.value)}
            >
              <option value="">Select team...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-2 text-textMuted hover:text-text focus:outline-none"
              onClick={() => void refreshTeams()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <div className="h-4 w-px bg-border mx-1"></div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-textMuted hidden md:inline">
                Logged in as: <span className="font-semibold text-text">{user?.name || user?.email}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-2 text-textMuted hover:text-alert flex items-center gap-1.5 focus:outline-none"
                onClick={logout}
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 md:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
