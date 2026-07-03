import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { SavingsTicket } from "../components/ui/SavingsTicket";
import {
  TableContainer,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Shield, HardHat, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { applyRecommendation, fetchDashboardHealth } from "../lib/api";
import { useAppState } from "../lib/appState";

const PremiumTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 shadow-lg rounded-lg">
        <p className="font-medium text-slate-500 text-sm mb-1">{label}</p>
        <p className="font-mono text-primary font-bold text-lg">
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { activeTeamId } = useAppState();
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchDashboardHealth>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await fetchDashboardHealth(activeTeamId);
      setData(dashboardData);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [activeTeamId]);

  const handleApplyRecommendation = async (recommendationId: string) => {
    await applyRecommendation(recommendationId);
    await loadDashboard();
  };

  const weeklyCostData = (data?.trend ?? []).map((point, index) => ({
    week: `P${index + 1}`,
    cost: point.cost,
  }));

  const spendDelta = data?.spendDelta ?? 0;
  const spendDeltaPercent = data?.spendDeltaPercent ?? 0;
  const savingsRatePercent = data?.savingsRatePercent ?? 0;
  const spendIsDown = spendDelta <= 0;
  const spendDeltaLabel = `${spendIsDown ? "▼" : "▲"} ${Math.abs(spendDelta).toFixed(2)} (${Math.abs(spendDeltaPercent).toFixed(1)}%)`;
  const savingsRateLabel = `${savingsRatePercent.toFixed(1)}% of spend`;

  const topRecommendations = (data?.recommendationList ?? []).slice(0, 2);
  const topTeams = (data?.leaderboard ?? []).slice(0, 2);

  return (
    <div className="space-y-8">
      {error ? (
        <Card className="border-alert bg-red-50">
          <CardContent className="py-4 text-alert font-medium">
            {error}
          </CardContent>
        </Card>
      ) : null}

      {/* 2. Headline Summary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1 h-full pt-1">
          <SavingsTicket
            title="Open Recommendations"
            rationale={
              loading
                ? "Loading recommendation summary..."
                : "Live recommendation summary from the API."
            }
            estimatedSavings={data?.savings ?? 0}
            confidence="High"
          />
        </div>

        <Card className="h-full flex flex-col justify-between group">
          <div>
            <CardHeader className="pb-2">
              <span className="text-xs text-primary font-semibold tracking-wider uppercase mb-1">
                Monthly Runrate
              </span>
              <CardTitle className="text-2xl text-text">Total Spend</CardTitle>
            </CardHeader>
            <CardContent className="mt-2">
              <div className="text-4xl font-mono font-bold tracking-tight text-text">
                ${Number(data?.totalSpend ?? 0).toFixed(2)}
              </div>
              <div
                className={`flex items-center gap-1.5 font-medium mt-4 text-sm rounded-full w-fit px-3 py-1 border ${spendIsDown ? "text-savings bg-emerald-50 border-emerald-100" : "text-alert bg-red-50 border-red-100"}`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>30d trend: {spendDeltaLabel}</span>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="h-full flex flex-col justify-between group">
          <div>
            <CardHeader className="pb-2">
              <span className="text-xs text-savings font-semibold tracking-wider uppercase mb-1">
                Infrastructure
              </span>
              <CardTitle className="text-2xl text-text">
                Active Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-2">
              <div className="text-4xl font-mono font-bold tracking-tight text-text">
                {data?.totalAssets ?? 0} Units
              </div>
              <div className="flex items-center gap-1.5 text-savings font-medium mt-4 text-sm bg-emerald-50 rounded-full w-fit px-3 py-1 border border-emerald-100">
                <Shield className="w-4 h-4" />
                <span>Saved: {savingsRateLabel}</span>
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
                <CardDescription className="mt-1">
                  Infrastructure cost growth over 12 weeks
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="w-fit mt-2 sm:mt-0 font-medium"
              >
                Trailing 90 Days
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surfaceMuted px-4 py-3 text-sm font-medium text-text">
                <span>Current vs previous 30 days</span>
                <span className={spendIsDown ? "text-savings" : "text-alert"}>
                  {spendDeltaLabel}
                </span>
              </div>
              <div className="h-72 w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyCostData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis
                      dataKey="week"
                      tick={{ fill: "#64748B", fontSize: 12 }}
                      axisLine={{ stroke: "#E2E8F0" }}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fill: "#64748B", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value}`}
                      dx={-10}
                    />
                    <Tooltip
                      content={<PremiumTooltip />}
                      cursor={{ fill: "#F8FAFC" }}
                    />
                    <Bar
                      dataKey="cost"
                      fill="#2563EB"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
                {!loading && weeklyCostData.length === 0 ? (
                  <div className="text-sm text-textMuted mt-4">
                    No cost data yet. Seed the database to populate this chart.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 mb-4 flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="text-xl">Top Savings Actions</CardTitle>
                <CardDescription className="mt-1">
                  Highest dollar impact recommendations
                </CardDescription>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="text-white bg-primary hover:bg-primary-hover"
                onClick={() => navigate("/recommendations")}
              >
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
                    {topRecommendations.length > 0 ? (
                      topRecommendations.map((item) => (
                        <TableRow key={item.id} className="group">
                          <TableCell>
                            <div className="font-semibold text-text group-hover:text-primary transition-colors">
                              {item.title}
                            </div>
                            <div className="text-xs font-mono text-textMuted mt-1">
                              {item.resource?.resourceUid ||
                                item.resourceId ||
                                "No resource linked"}
                            </div>
                          </TableCell>
                          <TableCell
                            isNumeric
                            className="font-semibold text-savings text-base"
                          >
                            ${Number(item.estimatedMonthlySavings).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="savings"
                              size="sm"
                              onClick={() =>
                                void handleApplyRecommendation(item.id)
                              }
                            >
                              Apply
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-textMuted py-8"
                        >
                          Seed the database to see recommendations here.
                        </TableCell>
                      </TableRow>
                    )}
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
              <CardDescription className="mt-1">
                Ranking teams by spending waste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topTeams.length > 0 ? (
                  topTeams.map((team, index) => (
                    <div
                      key={team.id}
                      className="p-4 bg-white border border-border rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg text-slate-400 w-4">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-sm text-text flex items-center gap-2">
                            {index === 0 ? (
                              <Shield className="w-4 h-4 text-savings" />
                            ) : (
                              <HardHat className="w-4 h-4 text-warning" />
                            )}
                            {team.name}
                          </div>
                          <div className="text-xs font-mono text-textMuted mt-1">
                            Spend: ${Number(team.totalSpend30d ?? 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          Number(team.efficiencyScore ?? 0) >= 80
                            ? "savings"
                            : "warning"
                        }
                        size="sm"
                      >
                        {Number(team.efficiencyScore ?? 0).toFixed(1)}%
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-textMuted">
                    No team data yet. Seed the database to populate this panel.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
