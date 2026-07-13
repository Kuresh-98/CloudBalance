import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchTeams, Team } from "./api";
import { useAuth } from "./AuthContext";

type AppRole = "viewer" | "admin";

type AppStateValue = {
  role: AppRole;
  setRole: (role: AppRole) => void;
  activeTeamId: string;
  setActiveTeamId: (teamId: string) => void;
  teams: Team[];
  refreshTeams: () => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | null>(null);

const roleStorageKey = "cloudlens-role";
const teamStorageKey = "cloudlens-team-id";

export const AppStateProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { user } = useAuth();
  const [role, setRoleState] = useState<AppRole>(() => {
    const storedRole = window.localStorage.getItem(
      roleStorageKey,
    ) as AppRole | null;
    return storedRole === "admin" ? "admin" : "viewer";
  });
  const [activeTeamId, setActiveTeamIdState] = useState(
    () => window.localStorage.getItem(teamStorageKey) || "",
  );
  const [teams, setTeams] = useState<Team[]>([]);

  const setRole = (nextRole: AppRole) => {
    setRoleState(nextRole);
    window.localStorage.setItem(roleStorageKey, nextRole);
  };

  const setActiveTeamId = (teamId: string) => {
    setActiveTeamIdState(teamId);
    window.localStorage.setItem(teamStorageKey, teamId);
  };

  const refreshTeams = async () => {
    const response = await fetchTeams();
    setTeams(response);

    if (!activeTeamId && response.length > 0) {
      setActiveTeamId(response[0].id);
    }
  };

  useEffect(() => {
    if (user) {
      void refreshTeams();
    } else {
      setTeams([]);
    }
  }, [user]);

  useEffect(() => {
    window.localStorage.setItem(roleStorageKey, role);
  }, [role]);

  useEffect(() => {
    if (!activeTeamId || teams.some((team) => team.id === activeTeamId)) {
      return;
    }

    if (teams.length > 0) {
      setActiveTeamId(teams[0].id);
    }
  }, [activeTeamId, teams]);

  const value = useMemo(
    () => ({
      role,
      setRole,
      activeTeamId,
      setActiveTeamId,
      teams,
      refreshTeams,
    }),
    [role, activeTeamId, teams],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export function useAppState() {
  const value = useContext(AppStateContext);

  if (!value) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return value;
}
