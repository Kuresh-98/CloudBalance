import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
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
import { Search } from "lucide-react";
import {
  createResource,
  deleteResource,
  fetchResources,
  fetchTeams,
  updateResource,
  Resource,
  Team,
} from "../lib/api";
import { useAppState } from "../lib/appState";

export const Resources: React.FC = () => {
  const { role, activeTeamId } = useAppState();
  const [search, setSearch] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    teamId: "",
    service: "EC2",
    region: "us-east-1",
    instanceType: "t3.medium",
    status: "running",
    tags: "{}",
    observedCpuUtil: "",
    observedMemUtil: "",
    observedNetworkInGb: "",
    observedNetworkOutGb: "",
  });
  const serviceOptions = [
    "EC2",
    "RDS",
    "EBS",
    "ElastiCache",
    "Lambda",
    "API Gateway",
  ];
  const regionOptions = [
    "us-east-1",
    "us-west-2",
    "eu-west-1",
    "ap-southeast-1",
  ];
  const statusOptions = [
    "running",
    "idle",
    "unattached",
    "stopped",
    "completed",
    "deleted",
  ];
  const instanceTypeOptions = [
    "t3.small",
    "t3.medium",
    "t3.large",
    "m5.large",
    "m5.xlarge",
    "db.t3.medium",
    "db.m5.large",
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resourceResponse, teamResponse] = await Promise.all([
        fetchResources(search, activeTeamId),
        fetchTeams(),
      ]);
      setResources(resourceResponse.resources);
      setTeams(teamResponse);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load resources",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, activeTeamId]);

  const filteredResources = useMemo(() => resources, [resources]);
  const openRecommendationCount = useMemo(
    () =>
      resources.reduce(
        (sum, resource) => sum + (resource.recommendations?.length || 0),
        0,
      ),
    [resources],
  );
  const teamCount = useMemo(
    () =>
      new Set(resources.map((resource) => resource.teamId).filter(Boolean))
        .size,
    [resources],
  );

  const resetForm = () => {
    setForm({
      teamId: activeTeamId || "",
      service: "EC2",
      region: "us-east-1",
      instanceType: "t3.medium",
      status: "running",
      tags: "{}",
      observedCpuUtil: "",
      observedMemUtil: "",
      observedNetworkInGb: "",
      observedNetworkOutGb: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        teamId: form.teamId || null,
        service: form.service.trim(),
        region: form.region.trim(),
        instanceType: form.instanceType.trim() || null,
        status: form.status.trim(),
        tags: JSON.parse(form.tags || "{}"),
        observedCpuUtil: form.observedCpuUtil
          ? Number(form.observedCpuUtil)
          : null,
        observedMemUtil: form.observedMemUtil
          ? Number(form.observedMemUtil)
          : null,
        observedNetworkInGb: form.observedNetworkInGb
          ? Number(form.observedNetworkInGb)
          : null,
        observedNetworkOutGb: form.observedNetworkOutGb
          ? Number(form.observedNetworkOutGb)
          : null,
      };

      if (editingId) {
        await updateResource(editingId, payload);
      } else {
        await createResource(payload);
      }

      await loadData();
      resetForm();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to save resource",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingId(resource.id);
    setForm({
      teamId: resource.teamId || activeTeamId || "",
      service: resource.service,
      region: resource.region,
      instanceType: resource.instanceType || "",
      status: resource.status,
      tags: JSON.stringify(resource.tags || {}, null, 2),
      observedCpuUtil:
        resource.usageMetrics?.[0]?.avgCpuUtil !== undefined &&
        resource.usageMetrics?.[0]?.avgCpuUtil !== null
          ? String(resource.usageMetrics[0].avgCpuUtil)
          : "",
      observedMemUtil:
        resource.usageMetrics?.[0]?.avgMemUtil !== undefined &&
        resource.usageMetrics?.[0]?.avgMemUtil !== null
          ? String(resource.usageMetrics[0].avgMemUtil)
          : "",
      observedNetworkInGb:
        resource.usageMetrics?.[0]?.networkInGb !== undefined &&
        resource.usageMetrics?.[0]?.networkInGb !== null
          ? String(resource.usageMetrics[0].networkInGb)
          : "",
      observedNetworkOutGb:
        resource.usageMetrics?.[0]?.networkOutGb !== undefined &&
        resource.usageMetrics?.[0]?.networkOutGb !== null
          ? String(resource.usageMetrics[0].networkOutGb)
          : "",
    });
  };

  useEffect(() => {
    if (!editingId && !form.teamId && activeTeamId) {
      setForm((current) => ({ ...current, teamId: activeTeamId }));
    }
  }, [activeTeamId, editingId, form.teamId]);

  const handleDelete = async (id: string) => {
    await deleteResource(id);
    await loadData();
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
          Resource Explorer
        </h1>
        <p className="text-ink font-bold uppercase mt-2">
          Search and filter cloud resources across teams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-textMuted">
              Resources loaded
            </div>
            <div className="mt-2 text-3xl font-mono font-bold text-ink">
              {resources.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-textMuted">
              Open recommendations
            </div>
            <div className="mt-2 text-3xl font-mono font-bold text-savings">
              {openRecommendationCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-textMuted">
              Teams represented
            </div>
            <div className="mt-2 text-3xl font-mono font-bold text-info">
              {teamCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b-2 border-ink bg-surfaceMuted">
          <CardTitle className="text-xl uppercase">
            {editingId ? "Edit Resource" : "Create Resource"}
          </CardTitle>
          <CardDescription className="text-ink font-bold uppercase mt-1">
            {editingId
              ? "You are editing an existing resource. The row highlight and prefilled form show the selected record."
              : "Resource UID is generated automatically when you save."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {role === "admin" ? (
            <Card className="border-warning bg-amber-50 mb-4">
              <CardContent className="py-4 text-ink font-medium">
                Admin mode is limited to team setup. Switch to Viewer mode to
                create or edit resources.
              </CardContent>
            </Card>
          ) : null}

          {editingId && role !== "admin" ? (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border-2 border-ink bg-amber-50 px-4 py-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ink/70">
                  Editing resource
                </div>
                <div className="font-mono font-bold text-ink">
                  {
                    resources.find((resource) => resource.id === editingId)
                      ?.resourceUid
                  }
                </div>
              </div>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel edit
              </Button>
            </div>
          ) : null}

          {role !== "admin" ? (
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleSubmit}
            >
              <select
                className="border-2 border-ink px-3 py-2 bg-white"
                value={form.teamId}
                onChange={(event) =>
                  setForm({ ...form, teamId: event.target.value })
                }
              >
                <option value="">Unassigned</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <select
                className="border-2 border-ink px-3 py-2 bg-white"
                value={form.service}
                onChange={(event) =>
                  setForm({ ...form, service: event.target.value })
                }
              >
                {serviceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                className="border-2 border-ink px-3 py-2 bg-white"
                value={form.region}
                onChange={(event) =>
                  setForm({ ...form, region: event.target.value })
                }
              >
                {regionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                className="border-2 border-ink px-3 py-2 bg-white"
                value={form.instanceType}
                onChange={(event) =>
                  setForm({ ...form, instanceType: event.target.value })
                }
              >
                {instanceTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                className="border-2 border-ink px-3 py-2 bg-white"
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <textarea
                className="border-2 border-ink px-3 py-2 bg-white md:col-span-2 min-h-28 font-mono text-sm"
                placeholder='Tags JSON, e.g. {"env":"prod"}'
                value={form.tags}
                onChange={(event) =>
                  setForm({ ...form, tags: event.target.value })
                }
              />
              <div className="md:col-span-2 rounded-xl border border-border bg-surfaceMuted/50 p-4 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-textMuted">
                  Utilization snapshot
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    className="border border-ink px-3 py-2 bg-white"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Observed CPU %"
                    value={form.observedCpuUtil}
                    onChange={(event) =>
                      setForm({ ...form, observedCpuUtil: event.target.value })
                    }
                  />
                  <input
                    className="border border-ink px-3 py-2 bg-white"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Observed memory %"
                    value={form.observedMemUtil}
                    onChange={(event) =>
                      setForm({ ...form, observedMemUtil: event.target.value })
                    }
                  />
                  <input
                    className="border border-ink px-3 py-2 bg-white"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Network in (GB)"
                    value={form.observedNetworkInGb}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        observedNetworkInGb: event.target.value,
                      })
                    }
                  />
                  <input
                    className="border border-ink px-3 py-2 bg-white"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Network out (GB)"
                    value={form.observedNetworkOutGb}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        observedNetworkOutGb: event.target.value,
                      })
                    }
                  />
                </div>
                <p className="text-xs text-textMuted">
                  Saved as the latest usage metric and shown in the utilization
                  column.
                </p>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Resource"
                      : "Create Resource"}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Reset
                </Button>
                <Button type="button" variant="ghost" onClick={loadData}>
                  Refresh
                </Button>
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4 border-b-2 border-ink bg-surfaceMuted">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="text-xl uppercase">
              Active Resources
            </CardTitle>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-textMuted"
                    >
                      Loading resources...
                    </TableCell>
                  </TableRow>
                ) : filteredResources.length > 0 ? (
                  filteredResources.map((res) => (
                    <TableRow
                      key={res.id}
                      className={`cursor-pointer ${editingId === res.id ? "bg-amber-50" : ""}`}
                    >
                      <TableCell className="font-mono text-sm text-ink font-bold">
                        {res.resourceUid}
                      </TableCell>
                      <TableCell className="font-bold">{res.service}</TableCell>
                      <TableCell className="font-bold">
                        {res.team?.name || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            res.status === "running" || res.status === "active"
                              ? "info"
                              : res.status === "Idle" ||
                                  res.status === "Unattached"
                                ? "warning"
                                : "primary"
                          }
                        >
                          {res.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {res.usageMetrics?.[0]
                          ? `${Number(res.usageMetrics[0].avgCpuUtil ?? 0).toFixed(1)}% CPU`
                          : "No usage data"}
                      </TableCell>
                      <TableCell
                        isNumeric
                        className="font-bold text-lg text-ink"
                      >
                        <div className="flex items-center justify-end gap-2">
                          <span>{res.instanceType || "-"}</span>
                          {role !== "admin" ? (
                            <>
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={() => handleEdit(res)}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="alert"
                                size="sm"
                                onClick={() => handleDelete(res.id)}
                              >
                                Delete
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-textMuted"
                    >
                      No resources found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};
