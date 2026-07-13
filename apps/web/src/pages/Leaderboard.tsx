import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Shield, HardHat, Database, Zap } from "lucide-react";
import { Button } from "../components/ui/Button";
import {
  createTeam,
  deleteTeam,
  fetchLeaderboard,
  fetchTeams,
  Team,
  updateTeam,
} from "../lib/api";
import { useAppState } from "../lib/appState";

export const Leaderboard: React.FC = () => {
  const { role, refreshTeams } = useAppState();
  const [leaderboard, setLeaderboard] = useState<Team[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", monthlyBudget: "" });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [leaderboardResponse, teamsResponse] = await Promise.all([
        fetchLeaderboard(),
        fetchTeams(),
      ]);
      setLeaderboard(leaderboardResponse);
      setTeams(teamsResponse);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load teams",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const displayedTeams = useMemo(
    () => (leaderboard.length > 0 ? leaderboard : teams),
    [leaderboard, teams],
  );

  const resetForm = () => {
    setForm({ name: "", monthlyBudget: "" });
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await updateTeam(editingId, {
          name: form.name.trim(),
          monthlyBudget: form.monthlyBudget ? Number(form.monthlyBudget) : null,
        });
      } else {
        await createTeam({
          name: form.name.trim(),
          monthlyBudget: form.monthlyBudget ? Number(form.monthlyBudget) : null,
        });
      }

      await loadData();
      await refreshTeams();
      resetForm();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to save team",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingId(team.id);
    setForm({
      name: team.name,
      monthlyBudget: team.monthlyBudget ? String(team.monthlyBudget) : "",
    });
  };

  const handleDelete = async (id: string) => {
    await deleteTeam(id);
    await loadData();
    await refreshTeams();
  };

  return (
    <div className="space-y-8">
      {error ? (
        <Card className="border-alert bg-red-50">
          <CardContent className="py-4 text-alert">{error}</CardContent>
        </Card>
      ) : null}

      <div>
        <h1 className="text-4xl font-display font-black text-ink uppercase tracking-tight">
          Team Leaderboard
        </h1>
        <p className="text-ink font-bold uppercase mt-2">
          Ranking teams by infrastructure efficiency and spending waste.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4 mb-4 border-b-2 border-ink">
            <CardTitle className="text-xl uppercase">
              Efficiency Rankings
            </CardTitle>
            <CardDescription className="text-ink font-bold uppercase mt-1">
              Chargeback framing based on resource utilization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="py-8 text-center text-textMuted">
                  Loading leaderboard...
                </div>
              ) : displayedTeams.length > 0 ? (
                displayedTeams
                  .map((team, idx) => ({
                    ...team,
                    _rank: idx + 1,
                  }))
                  .sort(
                    (a, b) =>
                      Number(b.efficiencyScore ?? 0) -
                      Number(a.efficiencyScore ?? 0),
                  )
                  .map((team) => (
                    <div
                      key={team.id}
                      className="p-5 bg-surface border-2 border-ink flex items-center justify-between transition-colors shadow-brutal-hover hover:bg-surfaceMuted"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-display font-black text-2xl w-6 text-savings">
                          {team._rank}
                        </span>
                        <div>
                          <div className="font-bold text-base uppercase flex items-center gap-2 text-ink">
                            {team._rank === 1 ? (
                              <Shield className="w-5 h-5 stroke-[3px] text-savings" />
                            ) : team._rank === 2 ? (
                              <Zap className="w-5 h-5 stroke-[3px] text-info" />
                            ) : team._rank === 3 ? (
                              <HardHat className="w-5 h-5 stroke-[3px] text-warning" />
                            ) : (
                              <Database className="w-5 h-5 stroke-[3px] text-alert" />
                            )}
                            {team.name}
                          </div>
                          <div className="text-xs font-mono font-bold mt-1 bg-surfaceMuted px-1 border border-ink w-fit">
                            Total Spend: $
                            {Number(team.totalSpend30d ?? 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-ink uppercase tracking-wider">
                          Efficiency
                        </span>
                        <Badge
                          variant={
                            Number(team.efficiencyScore ?? 0) >= 80
                              ? "savings"
                              : Number(team.efficiencyScore ?? 0) > 50
                                ? "warning"
                                : "alert"
                          }
                          size="md"
                          className="shadow-brutal-hover"
                        >
                          {Number(team.efficiencyScore ?? 0).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="py-8 text-center text-textMuted">
                  No teams found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {role === "admin" ? (
          <Card>
            <CardHeader className="pb-4 mb-4 border-b-2 border-ink">
              <CardTitle className="text-xl uppercase">Team Admin</CardTitle>
              <CardDescription className="text-ink font-bold uppercase mt-1">
                Create, update, or delete a team from the frontend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                  className="w-full border-2 border-ink px-3 py-2 bg-white"
                  placeholder="Team name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
                <input
                  className="w-full border-2 border-ink px-3 py-2 bg-white"
                  placeholder="Monthly budget"
                  type="number"
                  step="0.01"
                  value={form.monthlyBudget}
                  onChange={(event) =>
                    setForm({ ...form, monthlyBudget: event.target.value })
                  }
                />
                <div className="flex gap-3">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Team"
                        : "Create Team"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Reset
                  </Button>
                </div>
              </form>

              <div className="mt-6 space-y-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between gap-3 border-2 border-ink bg-surface p-4"
                  >
                    <div>
                      <div className="font-bold uppercase text-ink">
                        {team.name}
                      </div>
                      <div className="text-xs font-mono">
                        Budget:{" "}
                        {team.monthlyBudget
                          ? `$${Number(team.monthlyBudget).toFixed(2)}`
                          : "Unset"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(team)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="alert"
                        size="sm"
                        onClick={() => handleDelete(team.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-warning bg-amber-50">
            <CardContent className="py-6 text-ink font-medium">
              Switch to Admin mode from the top-right menu to manage teams and
              budgets.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
