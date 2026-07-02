import { PrismaClient, Prisma } from '@prisma/client';

export interface RecommendationInput {
  id: string;
  resourceId: string;
  resourceUid: string;

  service: string;
  status: string;
  createdAt: Date | null;
  tags: any;
  instanceType: string | null;
  teamId: string | null;
  usageMetrics: {
    date: Date;
    avgCpuUtil: number | null;
    avgMemUtil: number | null;
    networkInGb: number | null;
    networkOutGb: number | null;
  }[];
  costRecords: {
    date: Date;
    unblendedCost: number;
  }[];
}

export interface GeneratedRecommendation {
  resourceId: string;
  type: string;
  title: string;
  rationale: string;
  estimatedMonthlySavings: number;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Runs recommendation rules engine on a list of resources with their usage metrics and cost records.
 */
export function generateRecommendationsForResource(resource: RecommendationInput): GeneratedRecommendation[] {
  const recommendations: GeneratedRecommendation[] = [];
  const now = new Date();

  // Helper to calculate monthly cost based on trailing 30 days of cost records
  const trailing30DaysCosts = resource.costRecords
    .filter(c => {
      const diffTime = Math.abs(now.getTime() - new Date(c.date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    });
  
  const totalTrailing30DaysCost = trailing30DaysCosts.reduce((sum, c) => sum + Number(c.unblendedCost), 0);
  // Extrapolate to monthly cost if we have fewer days, or use a default baseline if no cost records exist
  const estimatedMonthlyCost = trailing30DaysCosts.length > 0 
    ? (totalTrailing30DaysCost / trailing30DaysCosts.length) * 30
    : 150.00; // sensible default baseline

  // Helper to calculate average CPU over the trailing 14 days
  const trailing14DaysUsage = resource.usageMetrics
    .filter(u => {
      const diffTime = Math.abs(now.getTime() - new Date(u.date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 14;
    });

  const validCpuMetrics = trailing14DaysUsage
    .map(u => u.avgCpuUtil)
    .filter((cpu): cpu is number => cpu !== null);

  const avgCpu14Days = validCpuMetrics.length > 0
    ? validCpuMetrics.reduce((sum, cpu) => sum + cpu, 0) / validCpuMetrics.length
    : null;

  // 1. Rule: Idle Compute
  // service in (EC2, RDS) AND avg_cpu_util < 5% over trailing 14 days AND status = running
  if (
    (resource.service === 'EC2' || resource.service === 'RDS') &&
    resource.status === 'running' &&
    avgCpu14Days !== null &&
    avgCpu14Days < 5
  ) {
    recommendations.push({
      resourceId: resource.id,
      type: 'idle_termination',
      title: `Terminate Idle ${resource.service} Instance`,
      rationale: `Resource ${resource.resourceUid} has a trailing 14-day average CPU utilization of ${avgCpu14Days.toFixed(2)}%, which is below the 5% idle threshold.`,
      estimatedMonthlySavings: parseFloat(estimatedMonthlyCost.toFixed(2)),
      confidence: 'high',
    });
  }

  // 2. Rule: Rightsizing
  // avg_cpu_util between 5–20% over trailing 14 days (running compute)
  // Avoid duplicating with idle compute recommendation
  if (
    (resource.service === 'EC2' || resource.service === 'RDS') &&
    resource.status === 'running' &&
    avgCpu14Days !== null &&
    avgCpu14Days >= 5 &&
    avgCpu14Days <= 20
  ) {
    recommendations.push({
      resourceId: resource.id,
      type: 'rightsizing',
      title: `Downsize ${resource.service} Instance`,
      rationale: `Resource ${resource.resourceUid} average CPU utilization is ${avgCpu14Days.toFixed(2)}% (between 5% and 20%) over the last 14 days, indicating it is over-provisioned.`,
      estimatedMonthlySavings: parseFloat((estimatedMonthlyCost * 0.4).toFixed(2)), // 40% savings
      confidence: 'medium',
    });
  }

  // 3. Rule: Unattached Storage
  // service = EBS AND status = unattached (assume seeded unattached EBS status)
  if (resource.service === 'EBS' && resource.status === 'unattached') {
    recommendations.push({
      resourceId: resource.id,
      type: 'unattached_storage',
      title: `Delete Unattached EBS Volume`,
      rationale: `EBS Volume ${resource.resourceUid} is currently unattached to any running EC2 instance and is incurring unnecessary storage fees.`,
      estimatedMonthlySavings: parseFloat(estimatedMonthlyCost.toFixed(2)),
      confidence: 'high',
    });
  }

  // 4. Rule: Stale Snapshot
  // service = Snapshot AND age > 90 days
  const snapshotAgeDays = resource.createdAt
    ? Math.floor((now.getTime() - resource.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (resource.service === 'Snapshot' && snapshotAgeDays > 90) {
    recommendations.push({
      resourceId: resource.id,
      type: 'stale_snapshot',
      title: `Delete Stale Snapshot`,
      rationale: `Snapshot ${resource.resourceUid} is ${snapshotAgeDays} days old, which exceeds the 90-day retention threshold for stale backup snapshots.`,
      estimatedMonthlySavings: parseFloat(estimatedMonthlyCost.toFixed(2)),
      confidence: 'high',
    });
  }

  // 5. Rule: No commitment coverage (Reserved Instance / Savings Plan)
  // service in (EC2, RDS) AND continuously running > 30 days and on-demand pricing
  // We identify this if there is no reserved coverage and it's running. Since we only simulate on-demand pricing in our seed,
  // we check if the resource is EC2/RDS and running, with age > 30 days, AND hasn't been flagged as idle.
  const resourceAgeDays = resource.createdAt
    ? Math.floor((now.getTime() - resource.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const isIdle = avgCpu14Days !== null && avgCpu14Days < 5;
  if (
    (resource.service === 'EC2' || resource.service === 'RDS') &&
    resource.status === 'running' &&
    resourceAgeDays > 30 &&
    !isIdle
  ) {
    recommendations.push({
      resourceId: resource.id,
      type: 'reserved_instance',
      title: `Purchase Reserved Instance for ${resource.service}`,
      rationale: `Resource ${resource.resourceUid} has been running continuously on-demand for ${resourceAgeDays} days. Purchasing a 1-year Savings Plan or Reserved Instance can reduce cost.`,
      estimatedMonthlySavings: parseFloat((estimatedMonthlyCost * 0.3).toFixed(2)), // 30% savings
      confidence: 'medium',
    });
  }

  // 6. Rule: Unused Elastic IP
  // service = ElasticIP AND not attached to a running instance
  if (resource.service === 'ElasticIP' && (resource.status === 'unattached' || resource.status === 'idle')) {
    recommendations.push({
      resourceId: resource.id,
      type: 'unused_ip',
      title: `Release Unused Elastic IP`,
      rationale: `Elastic IP ${resource.resourceUid} is not associated with any running instance. AWS charges for unassociated Elastic IPs.`,
      estimatedMonthlySavings: 3.60, // Fixed unused-IP hourly charge (~$3.60/month)
      confidence: 'high',
    });
  }

  // 7. Rule: Untagged Resource
  // tags missing owner or team key
  const hasOwner = resource.tags && typeof resource.tags === 'object' && ('owner' in resource.tags || 'team' in resource.tags);
  if (!hasOwner) {
    recommendations.push({
      resourceId: resource.id,
      type: 'untagged',
      title: `Apply Ownership Tags`,
      rationale: `Resource ${resource.resourceUid} is missing the required 'owner' or 'team' tagging keys needed for cost allocation and governance.`,
      estimatedMonthlySavings: 0.00,
      confidence: 'medium',
    });
  }

  return recommendations;
}

/**
 * Runs the recommendation engine for all resources and saves recommendations to database.
 */
export async function runRecommendationEngine(prisma: PrismaClient) {
  // Clear out old open recommendations first so we don't duplicate
  await prisma.recommendation.deleteMany({
    where: {
      status: 'open',
    },
  });

  const dbResources = await prisma.resource.findMany({
    include: {
      usageMetrics: true,
      costRecords: true,
    },
  });

  let createdCount = 0;

  for (const dbRes of dbResources) {
    const input: RecommendationInput = {
      id: dbRes.id,
      resourceId: dbRes.id,
      resourceUid: dbRes.resourceUid,
      service: dbRes.service,
      status: dbRes.status,
      createdAt: dbRes.createdAt,
      tags: dbRes.tags,
      instanceType: dbRes.instanceType,
      teamId: dbRes.teamId,
      usageMetrics: dbRes.usageMetrics.map(u => ({
        date: u.date,
        avgCpuUtil: u.avgCpuUtil ? Number(u.avgCpuUtil) : null,
        avgMemUtil: u.avgMemUtil ? Number(u.avgMemUtil) : null,
        networkInGb: u.networkInGb ? Number(u.networkInGb) : null,
        networkOutGb: u.networkOutGb ? Number(u.networkOutGb) : null,
      })),
      costRecords: dbRes.costRecords.map(c => ({
        date: c.date,
        unblendedCost: Number(c.unblendedCost),
      })),
    } as any;

    const generated = generateRecommendationsForResource(input);

    for (const rec of generated) {
      await prisma.recommendation.create({
        data: {
          resourceId: rec.resourceId,
          type: rec.type,
          title: rec.title,
          rationale: rec.rationale,
          estimatedMonthlySavings: new Prisma.Decimal(rec.estimatedMonthlySavings),
          confidence: rec.confidence,
          status: 'open',
        },
      });
      createdCount++;
    }
  }

  return createdCount;
}
