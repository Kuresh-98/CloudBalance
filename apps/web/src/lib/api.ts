const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.error?.message || payload?.error || "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export type Team = {
  id: string;
  name: string;
  monthlyBudget: string | number | null;
  totalSpend30d?: number;
  openRecommendationsCount?: number;
  potentialMonthlySavings?: number;
  efficiencyScore?: number;
};

export type Resource = {
  id: string;
  resourceUid: string;
  teamId: string | null;
  service: string;
  region: string;
  instanceType: string | null;
  status: string;
  tags: Record<string, unknown> | null;
  createdAt: string | null;
  team?: { name: string | null } | null;
  usageMetrics?: Array<{
    id: string;
    date: string;
    avgCpuUtil: string | number | null;
    avgMemUtil: string | number | null;
    networkInGb: string | number | null;
    networkOutGb: string | number | null;
  }>;
  recommendations?: Array<{
    id: string;
    type: string;
    estimatedMonthlySavings: string | number;
  }>;
};

export type Recommendation = {
  id: string;
  resourceId: string | null;
  type: string;
  title: string;
  rationale: string;
  estimatedMonthlySavings: string | number;
  confidence: string;
  status: string | null;
  createdAt: string | null;
  resource?: {
    resourceUid: string;
    service: string;
    team?: { name: string | null } | null;
  } | null;
};

export type CostTrendPoint = { date: string; cost: number };
export type CostSummaryPoint = { name: string; value: number };

export type UsageMetric = {
  id: string;
  resourceId: string | null;
  date: string;
  avgCpuUtil: string | number | null;
  avgMemUtil: string | number | null;
  networkInGb: string | number | null;
  networkOutGb: string | number | null;
};

export type DashboardHealth = {
  totalSpend: number;
  totalAssets: number;
  savings: number;
  recommendations: number;
  spendDelta: number;
  spendDeltaPercent: number;
  savingsRatePercent: number;
  leaderboard: Team[];
  trend: CostTrendPoint[];
  summary: CostSummaryPoint[];
  recommendationList: Recommendation[];
};

export async function fetchHealth() {
  return requestJson<{ status: string; timestamp: string }>("/api/health");
}

export async function fetchCostTrend(
  teamId?: string,
  range = "90d",
  interval: "daily" | "weekly" = "weekly",
) {
  return requestJson<CostTrendPoint[]>(
    `/api/costs/trend?range=${range}&interval=${interval}${teamId ? `&team=${teamId}` : ""}`,
  );
}

export async function fetchCostSummary(
  teamId?: string,
  range = "30d",
  groupBy: "service" | "team" | "region" = "service",
) {
  return requestJson<CostSummaryPoint[]>(
    `/api/costs/summary?range=${range}&groupBy=${groupBy}${teamId ? `&team=${teamId}` : ""}`,
  );
}

export async function fetchRecommendations(teamId?: string, status = "open") {
  return requestJson<{ recommendations: Recommendation[] }>(
    `/api/recommendations?status=${status}&sort=savings&limit=100${teamId ? `&team=${teamId}` : ""}`,
  );
}

export async function createRecommendation(payload: {
  resourceId?: string | null;
  type: string;
  title: string;
  rationale: string;
  estimatedMonthlySavings: string | number;
  confidence: string;
  status?: string | null;
}) {
  return requestJson<Recommendation>("/api/recommendations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRecommendation(
  id: string,
  payload: Partial<{
    resourceId: string | null;
    type: string;
    title: string;
    rationale: string;
    estimatedMonthlySavings: string | number;
    confidence: string;
    status: string | null;
  }>,
) {
  return requestJson<Recommendation>(`/api/recommendations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteRecommendation(id: string) {
  return requestJson<void>(`/api/recommendations/${id}`, { method: "DELETE" });
}

export async function applyRecommendation(id: string) {
  return requestJson<Recommendation>(`/api/recommendations/${id}/apply`, {
    method: "POST",
  });
}

export async function dismissRecommendation(id: string) {
  return requestJson<Recommendation>(`/api/recommendations/${id}/dismiss`, {
    method: "POST",
  });
}

export async function reopenRecommendation(id: string) {
  return requestJson<Recommendation>(`/api/recommendations/${id}/reopen`, {
    method: "POST",
  });
}

export async function fetchResources(query = "", teamId?: string) {
  const queryParams = new URLSearchParams();
  if (query) {
    queryParams.set("search", query);
  }
  if (teamId) {
    queryParams.set("team", teamId);
  }
  queryParams.set("limit", "100");

  return requestJson<{ resources: Resource[] }>(
    `/api/resources${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
}

export async function createResource(payload: {
  resourceUid?: string;
  teamId?: string | null;
  service: string;
  region: string;
  instanceType?: string | null;
  status: string;
  tags?: Record<string, unknown>;
  observedCpuUtil?: string | number | null;
  observedMemUtil?: string | number | null;
  observedNetworkInGb?: string | number | null;
  observedNetworkOutGb?: string | number | null;
}) {
  return requestJson<Resource>("/api/resources", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateResource(
  id: string,
  payload: Partial<{
    resourceUid: string;
    teamId: string | null;
    service: string;
    region: string;
    instanceType: string | null;
    status: string;
    tags: Record<string, unknown>;
  }>,
) {
  return requestJson<Resource>(`/api/resources/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteResource(id: string) {
  return requestJson<void>(`/api/resources/${id}`, { method: "DELETE" });
}

export async function fetchUsageMetrics(resourceId: string) {
  return requestJson<UsageMetric[]>(`/api/resources/${resourceId}/usage`);
}

export async function createUsageMetric(
  resourceId: string,
  payload: {
    date: string;
    avgCpuUtil?: string | number | null;
    avgMemUtil?: string | number | null;
    networkInGb?: string | number | null;
    networkOutGb?: string | number | null;
  },
) {
  return requestJson<UsageMetric>(`/api/resources/${resourceId}/usage`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchTeams() {
  return requestJson<Team[]>("/api/teams");
}

export async function fetchLeaderboard() {
  return requestJson<Team[]>("/api/teams/leaderboard");
}

export async function createTeam(payload: {
  name: string;
  monthlyBudget?: string | number | null;
}) {
  return requestJson<Team>("/api/teams", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTeam(
  id: string,
  payload: Partial<{ name: string; monthlyBudget: string | number | null }>,
) {
  return requestJson<Team>(`/api/teams/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTeam(id: string) {
  return requestJson<void>(`/api/teams/${id}`, { method: "DELETE" });
}

export async function fetchDashboardHealth(teamId?: string): Promise<DashboardHealth> {
  const [trend, summary, recommendations, leaderboard, resources] =
    await Promise.all([
      fetchCostTrend(teamId),
      fetchCostSummary(teamId),
      fetchRecommendations(teamId, "open"),
      fetchLeaderboard(),
      fetchResources("", teamId),
    ]);

  const totalSpend = summary.reduce((sum, item) => sum + item.value, 0);
  const totalAssets = resources.resources.length;
  const savings = recommendations.recommendations.reduce(
    (sum, item) => sum + Number(item.estimatedMonthlySavings || 0),
    0,
  );
  const recentSpend = trend
    .slice(-30)
    .reduce((sum, item) => sum + item.cost, 0);
  const previousSpend = trend
    .slice(-60, -30)
    .reduce((sum, item) => sum + item.cost, 0);
  const spendDelta = recentSpend - previousSpend;
  const spendDeltaPercent =
    previousSpend > 0 ? (spendDelta / previousSpend) * 100 : 0;
  const savingsRatePercent = totalSpend > 0 ? (savings / totalSpend) * 100 : 0;

  return {
    totalSpend,
    totalAssets,
    savings,
    recommendations: recommendations.recommendations.length,
    spendDelta,
    spendDeltaPercent,
    savingsRatePercent,
    leaderboard,
    trend,
    summary,
    recommendationList: recommendations.recommendations,
  };
}
