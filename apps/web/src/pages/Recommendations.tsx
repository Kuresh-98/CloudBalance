import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { SavingsTicket } from "../components/ui/SavingsTicket";
import {
  applyRecommendation,
  createRecommendation,
  deleteRecommendation,
  dismissRecommendation,
  fetchRecommendations,
  fetchResources,
  reopenRecommendation,
  Resource,
  Recommendation,
} from "../lib/api";
import { useAppState } from "../lib/appState";

export const Recommendations: React.FC = () => {
  const { role, activeTeamId } = useAppState();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    resourceId: "",
    type: "Idle",
    title: "",
    rationale: "",
    estimatedMonthlySavings: "",
    confidence: "High",
  });
  const typeOptions = [
    "Idle",
    "Unused",
    "Right-size",
    "Capacity",
    "Commitment",
  ];
  const confidenceOptions = ["High", "Medium", "Low"];
  const resourceOptions = resources.map((resource) => ({
    id: resource.id,
    label: `${resource.resourceUid} · ${resource.service} · ${resource.team?.name || "Unassigned"}`,
  }));

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const [recommendationResponse, resourceResponse] = await Promise.all([
        fetchRecommendations(activeTeamId, "all"),
        fetchResources("", activeTeamId),
      ]);
      setRecommendations(recommendationResponse.recommendations);
      setResources(resourceResponse.resources);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load recommendations",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecommendations();
  }, [activeTeamId]);

  const refreshAndNotify = async (message: string) => {
    setActionMessage(message);
    await loadRecommendations();
  };

  const handleApply = async (id: string) => {
    await applyRecommendation(id);
    await refreshAndNotify("Recommendation applied successfully.");
  };

  const handleDismiss = async (id: string) => {
    await dismissRecommendation(id);
    await refreshAndNotify("Recommendation dismissed.");
  };

  const handleReopen = async (id: string) => {
    await reopenRecommendation(id);
    await refreshAndNotify("Recommendation reopened.");
  };

  const handleDelete = async (id: string) => {
    await deleteRecommendation(id);
    await refreshAndNotify("Recommendation deleted.");
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);

    try {
      const typeMapping: Record<string, string> = {
        "Idle": "idle_termination",
        "Unused": "unattached_storage",
        "Right-size": "rightsizing",
      };
      const actualType = typeMapping[form.type] || form.type.trim();

      await createRecommendation({
        resourceId: form.resourceId.trim() || null,
        type: actualType,
        title: form.title.trim(),
        rationale: form.rationale.trim(),
        estimatedMonthlySavings: Number(form.estimatedMonthlySavings),
        confidence: form.confidence.trim(),
        status: "open",
      });

      setForm({
        resourceId: "",
        type: "Idle",
        title: "",
        rationale: "",
        estimatedMonthlySavings: "",
        confidence: "High",
      });

      await refreshAndNotify("Recommendation created.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to create recommendation",
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredRecs = useMemo(() => {
    let normalized = recommendations;
    if (filter === "Idle") {
      normalized = recommendations.filter((item) => item.type === "idle_termination");
    } else if (filter === "Unused") {
      normalized = recommendations.filter((item) => item.type === "unattached_storage" || item.type === "unused_ip");
    } else if (filter === "Right-size") {
      normalized = recommendations.filter((item) => item.type === "rightsizing");
    } else if (filter !== "All") {
      normalized = recommendations.filter((item) => item.type === filter);
    }

    return [...normalized].sort(
      (a, b) =>
        Number(b.estimatedMonthlySavings) - Number(a.estimatedMonthlySavings),
    );
  }, [filter, recommendations]);

  const totalPotentialSavings = useMemo(
    () =>
      recommendations.reduce(
        (sum, item) => sum + Number(item.estimatedMonthlySavings || 0),
        0,
      ),
    [recommendations],
  );
  const openCount = recommendations.filter(
    (item) => (item.status || "open") === "open",
  ).length;
  const appliedCount = recommendations.filter(
    (item) => item.status === "applied",
  ).length;

  return (
    <div className="space-y-8">
      {error ? (
        <Card className="border-alert bg-red-50">
          <CardContent className="py-4 text-alert">{error}</CardContent>
        </Card>
      ) : null}
      {actionMessage ? (
        <Card className="border-savings bg-emerald-50">
          <CardContent className="py-4 text-savings">
            {actionMessage}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-ink uppercase tracking-tight">
            Recommendations
          </h1>
          <p className="text-ink font-bold uppercase mt-2">
            Review and apply cost-saving opportunities.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 bg-white border-2 border-ink p-1 shadow-brutal">
          {["All", "Idle", "Unused", "Right-size"].map((type) => (
            <Button
              key={type}
              variant={filter === type ? "primary" : "secondary"}
              size="sm"
              onClick={() => setFilter(type)}
              className={
                filter === type
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-ink border-ink hover:bg-surfaceMuted"
              }
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-textMuted">
              Open recommendations
            </div>
            <div className="mt-2 text-3xl font-mono font-bold text-ink">
              {openCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-textMuted">
              Potential savings
            </div>
            <div className="mt-2 text-3xl font-mono font-bold text-savings">
              ${totalPotentialSavings.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-textMuted">
              Applied actions
            </div>
            <div className="mt-2 text-3xl font-mono font-bold text-info">
              {appliedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {role !== "admin" ? (
            <Card className="bg-surfaceMuted/30 border-border">
              <CardHeader>
                <CardTitle className="text-xl uppercase">
                  Create Recommendation
                </CardTitle>
                <CardDescription className="text-ink font-bold uppercase mt-1">
                  Add a new item to the live API and test the CRUD flow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  onSubmit={handleCreate}
                >
                  <input
                    className="border border-ink px-3 py-2 bg-white"
                    placeholder="Title"
                    value={form.title}
                    onChange={(event) =>
                      setForm({ ...form, title: event.target.value })
                    }
                  />
                  <select
                    className="border border-ink px-3 py-2 bg-white"
                    value={form.resourceId}
                    onChange={(event) =>
                      setForm({ ...form, resourceId: event.target.value })
                    }
                  >
                    <option value="">No resource linked</option>
                    {resourceOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border border-ink px-3 py-2 bg-white"
                    value={form.type}
                    onChange={(event) =>
                      setForm({ ...form, type: event.target.value })
                    }
                  >
                    {typeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border border-ink px-3 py-2 bg-white"
                    value={form.confidence}
                    onChange={(event) =>
                      setForm({ ...form, confidence: event.target.value })
                    }
                  >
                    {confidenceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <input
                    className="border border-ink px-3 py-2 bg-white md:col-span-2"
                    placeholder="Rationale"
                    value={form.rationale}
                    onChange={(event) =>
                      setForm({ ...form, rationale: event.target.value })
                    }
                  />
                  <input
                    className="border border-ink px-3 py-2 bg-white"
                    type="number"
                    step="0.01"
                    placeholder="Estimated monthly savings"
                    value={form.estimatedMonthlySavings}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        estimatedMonthlySavings: event.target.value,
                      })
                    }
                  />
                  <Button
                    type="submit"
                    variant="savings"
                    size="md"
                    disabled={creating}
                    className="md:col-span-1"
                  >
                    {creating ? "Creating..." : "Create Recommendation"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-warning bg-amber-50">
              <CardContent className="py-6 text-ink font-medium">
                Admin mode is limited to team and budget setup. Switch to Viewer
                mode to create or act on recommendations.
              </CardContent>
            </Card>
          )}

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center text-textMuted">
                Loading recommendations...
              </CardContent>
            </Card>
          ) : filteredRecs.length > 0 ? (
            filteredRecs.map((rec) => (
              <Card
                key={rec.id}
                className="overflow-hidden hover:bg-surfaceMuted/50 transition-colors"
              >
                <CardContent className="p-0">
                  <div className="p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-black text-xl text-ink uppercase tracking-tight">
                          {rec.title}
                        </h3>
                        <Badge
                          variant={
                            rec.confidence === "High" ? "savings" : "warning"
                          }
                        >
                          {rec.confidence} Confidence
                        </Badge>
                        <Badge
                          variant={
                            rec.status === "applied"
                              ? "info"
                              : rec.status === "dismissed"
                                ? "outline"
                                : "primary"
                          }
                        >
                          {rec.status || "open"}
                        </Badge>
                      </div>
                      <div className="inline-block bg-surface border border-ink px-2 py-0.5">
                        <p className="text-xs font-mono font-bold text-ink">
                          {rec.resource?.resourceUid ||
                            rec.resourceId ||
                            "No resource linked"}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-ink leading-relaxed">
                        {rec.rationale}
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-4 min-w-[140px] bg-surface border-2 border-ink p-4 shadow-brutal w-full md:w-auto">
                      <div className="text-3xl font-mono font-bold text-savings">
                        ${Number(rec.estimatedMonthlySavings).toFixed(2)}
                        <span className="text-sm text-ink font-sans font-bold uppercase ml-1">
                          /mo
                        </span>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto flex-wrap">
                        {role !== "admin" ? (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleDismiss(rec.id)}
                              className="flex-1 md:flex-none"
                            >
                              Dismiss
                            </Button>
                            <Button
                              variant="savings"
                              size="sm"
                              onClick={() => handleApply(rec.id)}
                              className="flex-1 md:flex-none"
                            >
                              Apply
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReopen(rec.id)}
                              className="flex-1 md:flex-none"
                            >
                              Reopen
                            </Button>
                            <Button
                              variant="alert"
                              size="sm"
                              onClick={() => handleDelete(rec.id)}
                              className="flex-1 md:flex-none"
                            >
                              Delete
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wider text-textMuted">
                            Read only in admin mode
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-xl font-bold uppercase">
                  No recommendations found.
                </p>
                <p className="font-mono mt-2">Zero waste detected.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <SavingsTicket
            title="Total Potential Savings"
            rationale="Live open recommendation sum from the API."
            estimatedSavings={totalPotentialSavings}
            confidence="High"
          />
        </div>
      </div>
    </div>
  );
};
