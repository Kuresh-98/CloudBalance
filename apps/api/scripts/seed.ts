import { PrismaClient, Prisma } from '@prisma/client';
import { runRecommendationEngine } from '../src/services/recommendationEngine';

const prisma = new PrismaClient();

// Helper to generate a random number between min and max
function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Helper to format date as YYYY-MM-DD in UTC
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing database tables in reverse order of foreign keys
  console.log('🧹 Clearing existing data...');
  await prisma.recommendation.deleteMany();
  await prisma.costRecord.deleteMany();
  await prisma.usageMetric.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.team.deleteMany();

  // 2. Create Teams
  console.log('👥 Creating teams...');
  const teamsData = [
    { name: 'Platform', monthlyBudget: 18000.00 },
    { name: 'Growth', monthlyBudget: 9000.00 },
    { name: 'Data', monthlyBudget: 15000.00 },
    { name: 'Mobile', monthlyBudget: 6000.00 },
    { name: 'Security', monthlyBudget: 4000.00 },
  ];

  const teams: any[] = [];
  for (const t of teamsData) {
    const createdTeam = await prisma.team.create({
      data: {
        name: t.name,
        monthlyBudget: new Prisma.Decimal(t.monthlyBudget),
      },
    });
    teams.push(createdTeam);
  }
  console.log(`Created ${teams.length} teams.`);

  // 3. Define Resources config
  console.log('⚙️ Preparing resources...');
  const now = new Date();
  
  // Date configuration
  const startDay = new Date();
  startDay.setDate(now.getDate() - 90); // 90 days ago

  const resourcesData: {
    resourceUid: string;
    service: string;
    region: string;
    instanceType: string | null;
    status: string;
    tags: Record<string, string>;
    teamIndex: number;
    createdAt: Date;
    // planted attributes
    isPlantedIdle?: boolean;
    isPlantedRightsizing?: boolean;
    isPlantedUnattachedStorage?: boolean;
    isPlantedStaleSnapshot?: boolean;
    isPlantedNoCommitment?: boolean;
    isPlantedUnusedIP?: boolean;
    isUntagged?: boolean;
  }[] = [];

  // Generate 50 resources with various statuses and plant recommendations
  let resourceCounter = 1;

  // Helper to get random team
  const getRandomTeamIndex = () => Math.floor(Math.random() * teams.length);
  const getRandomRegion = () => ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'][Math.floor(Math.random() * 4)];

  // --- PLANTING ISSUES ---

  // A. Plant Idle Compute (low CPU for 14+ days, status = running)
  // Plant 2 idle EC2 and 1 idle RDS
  resourcesData.push({
    resourceUid: `i-0idleec201abc`,
    service: 'EC2',
    region: 'us-east-1',
    instanceType: 't3.xlarge',
    status: 'running',
    tags: { owner: 'platform-team', env: 'prod', Name: 'production-monitoring-bastion' },
    teamIndex: 0, // Platform
    createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    isPlantedIdle: true,
  });

  resourcesData.push({
    resourceUid: `i-0idleec202def`,
    service: 'EC2',
    region: 'us-west-2',
    instanceType: 'm5.2xlarge',
    status: 'running',
    tags: { owner: 'growth-team', env: 'dev', Name: 'growth-testing-box' },
    teamIndex: 1, // Growth
    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    isPlantedIdle: true,
  });

  resourcesData.push({
    resourceUid: `db-0idlerds01xyz`,
    service: 'RDS',
    region: 'eu-west-1',
    instanceType: 'db.m5.xlarge',
    status: 'running',
    tags: { owner: 'data-team', env: 'staging', Name: 'analytics-replica-staging' },
    teamIndex: 2, // Data
    createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    isPlantedIdle: true,
  });

  // B. Plant Rightsizing (running, avg CPU 5-20% over 14 days)
  // Plant 3 EC2 and 1 RDS rightsizing cases
  resourcesData.push({
    resourceUid: `i-0rightsize01ec2`,
    service: 'EC2',
    region: 'us-east-1',
    instanceType: 'c5.4xlarge',
    status: 'running',
    tags: { owner: 'data-team', env: 'prod', Name: 'data-processing-node-1' },
    teamIndex: 2, // Data
    createdAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
    isPlantedRightsizing: true,
  });

  resourcesData.push({
    resourceUid: `i-0rightsize02ec2`,
    service: 'EC2',
    region: 'us-east-1',
    instanceType: 'm5.xlarge',
    status: 'running',
    tags: { owner: 'mobile-team', env: 'prod', Name: 'push-notification-worker' },
    teamIndex: 3, // Mobile
    createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
    isPlantedRightsizing: true,
  });

  resourcesData.push({
    resourceUid: `i-0rightsize03ec2`,
    service: 'EC2',
    region: 'ap-southeast-1',
    instanceType: 't3.2xlarge',
    status: 'running',
    tags: { owner: 'growth-team', env: 'staging', Name: 'growth-landing-page' },
    teamIndex: 1, // Growth
    createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
    isPlantedRightsizing: true,
  });

  resourcesData.push({
    resourceUid: `db-0rightsizerds`,
    service: 'RDS',
    region: 'us-east-1',
    instanceType: 'db.r5.2xlarge',
    status: 'running',
    tags: { owner: 'platform-team', env: 'prod', Name: 'platform-user-metadata' },
    teamIndex: 0, // Platform
    createdAt: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
    isPlantedRightsizing: true,
  });

  // C. Plant Unattached Storage (EBS, status = unattached)
  // Plant 2 EBS volumes
  resourcesData.push({
    resourceUid: `vol-0unattached01`,
    service: 'EBS',
    region: 'us-east-1',
    instanceType: 'gp3 (1000 GB)',
    status: 'unattached',
    tags: { owner: 'growth-team', env: 'dev' },
    teamIndex: 1, // Growth
    createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    isPlantedUnattachedStorage: true,
  });

  resourcesData.push({
    resourceUid: `vol-0unattached02`,
    service: 'EBS',
    region: 'eu-west-1',
    instanceType: 'io2 (500 GB)',
    status: 'unattached',
    tags: { owner: 'platform-team', env: 'staging' },
    teamIndex: 0, // Platform
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    isPlantedUnattachedStorage: true,
  });

  // D. Plant Stale Snapshot (Snapshot, age > 90 days)
  // Plant 2 Snapshots
  resourcesData.push({
    resourceUid: `snap-0stalesnap01`,
    service: 'Snapshot',
    region: 'us-east-1',
    instanceType: '100 GB Backup',
    status: 'completed',
    tags: { owner: 'security-team', env: 'prod' },
    teamIndex: 4, // Security
    createdAt: new Date(now.getTime() - 110 * 24 * 60 * 60 * 1000), // 110 days old!
    isPlantedStaleSnapshot: true,
  });

  resourcesData.push({
    resourceUid: `snap-0stalesnap02`,
    service: 'Snapshot',
    region: 'us-west-2',
    instanceType: '500 GB Analytics Backup',
    status: 'completed',
    tags: { owner: 'data-team', env: 'prod' },
    teamIndex: 2, // Data
    createdAt: new Date(now.getTime() - 125 * 24 * 60 * 60 * 1000), // 125 days old!
    isPlantedStaleSnapshot: true,
  });

  // E. Plant No Commitment Coverage (running > 30 days, higher CPU usage > 20%, on-demand)
  // Plant 2 instances
  resourcesData.push({
    resourceUid: `i-0nocommit01ec2`,
    service: 'EC2',
    region: 'us-east-1',
    instanceType: 'm5.4xlarge',
    status: 'running',
    tags: { owner: 'platform-team', env: 'prod', Name: 'main-k8s-control-plane' },
    teamIndex: 0, // Platform
    createdAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
    isPlantedNoCommitment: true,
  });

  resourcesData.push({
    resourceUid: `db-0nocommit02rds`,
    service: 'RDS',
    region: 'us-east-1',
    instanceType: 'db.m5.4xlarge',
    status: 'running',
    tags: { owner: 'data-team', env: 'prod', Name: 'production-warehouse' },
    teamIndex: 2, // Data
    createdAt: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000),
    isPlantedNoCommitment: true,
  });

  // F. Plant Unused IP (ElasticIP, status = idle/unattached)
  resourcesData.push({
    resourceUid: `eip-0unusedip`,
    service: 'ElasticIP',
    region: 'us-east-1',
    instanceType: 'Public IP',
    status: 'idle',
    tags: { owner: 'platform-team', env: 'prod' },
    teamIndex: 0, // Platform
    createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
    isPlantedUnusedIP: true,
  });

  // G. Plant Untagged Resource (no owner or team keys)
  // Plant 2 resources
  resourcesData.push({
    resourceUid: `i-0untagged01ec2`,
    service: 'EC2',
    region: 'us-east-1',
    instanceType: 't3.medium',
    status: 'running',
    tags: { env: 'prod' }, // missing owner and team
    teamIndex: 0, // Platform (but not tagged as such)
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    isUntagged: true,
  });

  resourcesData.push({
    resourceUid: `s3-0untagged02bucket`,
    service: 'S3',
    region: 'eu-west-1',
    instanceType: 'Standard Storage',
    status: 'active',
    tags: { purpose: 'temp-logs' }, // missing owner and team
    teamIndex: 1, // Growth (but not tagged as such)
    createdAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
    isUntagged: true,
  });

  // --- GENERATE OTHER NORMAL RESOURCES ---
  // We need around 35 more resources to make a total of 50 resources.
  const services = ['EC2', 'RDS', 'EBS', 'S3', 'Lambda'];
  const ec2Types = ['t3.nano', 't3.micro', 't3.small', 't3.medium', 't3.large', 'm5.large', 'm5.xlarge', 'c5.large'];
  const rdsTypes = ['db.t3.micro', 'db.t3.small', 'db.t3.medium', 'db.m5.large', 'db.r5.large'];

  while (resourcesData.length < 50) {
    const service = services[Math.floor(Math.random() * services.length)];
    let instanceType: string | null = null;
    let status = 'running';
    let tags: Record<string, string> = {};

    const teamIdx = getRandomTeamIndex();
    const teamName = teams[teamIdx].name.toLowerCase();

    if (service === 'EC2') {
      instanceType = ec2Types[Math.floor(Math.random() * ec2Types.length)];
      status = Math.random() > 0.08 ? 'running' : 'stopped';
      tags = { owner: `${teamName}-team`, env: Math.random() > 0.3 ? 'prod' : 'staging', Name: `${teamName}-service-${resourceCounter}` };
    } else if (service === 'RDS') {
      instanceType = rdsTypes[Math.floor(Math.random() * rdsTypes.length)];
      status = 'running';
      tags = { owner: `${teamName}-team`, env: Math.random() > 0.3 ? 'prod' : 'staging', Name: `${teamName}-db-${resourceCounter}` };
    } else if (service === 'EBS') {
      const size = Math.floor(randomRange(20, 300));
      instanceType = `gp3 (${size} GB)`;
      status = 'attached';
      tags = { owner: `${teamName}-team`, env: 'prod' };
    } else if (service === 'S3') {
      instanceType = 'Standard Storage';
      status = 'active';
      tags = { owner: `${teamName}-team`, env: 'prod', Name: `cloudlens-${teamName}-data-${resourceCounter}` };
    } else if (service === 'Lambda') {
      instanceType = 'Serverless (128MB)';
      status = 'active';
      tags = { owner: `${teamName}-team`, env: 'prod', Name: `${teamName}-api-handler` };
    }

    resourcesData.push({
      resourceUid: `${service.toLowerCase()}-${Math.floor(randomRange(1000, 9999))}-${resourceCounter}`,
      service,
      region: getRandomRegion(),
      instanceType,
      status,
      tags,
      teamIndex: teamIdx,
      createdAt: new Date(now.getTime() - randomRange(10, 85) * 24 * 60 * 60 * 1000),
    });

    resourceCounter++;
  }

  // Save Resources and compute records
  console.log(`💾 Inserting ${resourcesData.length} resources into Database...`);
  const dbResources: any[] = [];
  for (const r of resourcesData) {
    const createdResource = await prisma.resource.create({
      data: {
        resourceUid: r.resourceUid,
        teamId: r.isUntagged ? null : teams[r.teamIndex].id, // Untagged resources might not have team mapping
        service: r.service,
        region: r.region,
        instanceType: r.instanceType,
        status: r.status,
        tags: r.tags as any,
        createdAt: r.createdAt,
      },
    });
    dbResources.push({
      ...createdResource,
      meta: r, // carry metadata along for usage/cost generation
    });
  }

  // 4. Generate Cost Records and Usage Metrics for the trailing 90 days
  console.log('📊 Generating cost and usage records (90-day history)...');
  
  const costRecordsToCreate: Prisma.CostRecordCreateManyInput[] = [];
  const usageMetricsToCreate: Prisma.UsageMetricCreateManyInput[] = [];

  for (const dbRes of dbResources) {
    const meta = dbRes.meta;
    const resourceId = dbRes.id;
    const createdDate = new Date(dbRes.createdAt);

    // Baseline daily cost based on service and instance type
    let dailyCostBaseline = 1.00;
    if (dbRes.service === 'EC2') {
      if (dbRes.instanceType.includes('xlarge')) dailyCostBaseline = 9.60;
      else if (dbRes.instanceType.includes('2xlarge')) dailyCostBaseline = 19.20;
      else if (dbRes.instanceType.includes('4xlarge')) dailyCostBaseline = 38.40;
      else if (dbRes.instanceType.includes('large')) dailyCostBaseline = 4.80;
      else dailyCostBaseline = 0.50; // nano/micro/small
      if (dbRes.status === 'stopped') dailyCostBaseline = 0.05; // tiny cost for root EBS volume storage only
    } else if (dbRes.service === 'RDS') {
      if (dbRes.instanceType.includes('2xlarge')) dailyCostBaseline = 24.00;
      else if (dbRes.instanceType.includes('xlarge')) dailyCostBaseline = 12.00;
      else if (dbRes.instanceType.includes('large')) dailyCostBaseline = 6.00;
      else dailyCostBaseline = 1.20; // micro/small/medium
    } else if (dbRes.service === 'EBS') {
      const sizeStr = dbRes.instanceType.match(/\d+/);
      const size = sizeStr ? parseInt(sizeStr[0]) : 100;
      dailyCostBaseline = (size * 0.08) / 30; // $0.08 per GB per month
    } else if (dbRes.service === 'S3') {
      dailyCostBaseline = randomRange(0.20, 5.00);
    } else if (dbRes.service === 'Lambda') {
      dailyCostBaseline = randomRange(0.02, 0.80);
    } else if (dbRes.service === 'Snapshot') {
      const sizeStr = dbRes.instanceType.match(/\d+/);
      const size = sizeStr ? parseInt(sizeStr[0]) : 100;
      dailyCostBaseline = (size * 0.05) / 30; // $0.05 per GB per month
    } else if (dbRes.service === 'ElasticIP') {
      dailyCostBaseline = dbRes.status === 'idle' ? 0.12 : 0.00; // unused EIP is $0.005/hr, i.e. $0.12/day.
    }

    // Daily loop for 90 days (if resource was created)
    for (let dayOffset = 0; dayOffset <= 90; dayOffset++) {
      const currentDate = new Date(startDay);
      currentDate.setDate(startDay.getDate() + dayOffset);

      // Skip days before resource creation
      if (currentDate < createdDate) continue;

      // Add a slight cost trend + daily noise (±5%)
      const trendMultiplier = 1 + (dayOffset / 180); // slow upward cost trend over 90 days
      const noise = randomRange(0.95, 1.05);
      const dailyCost = dailyCostBaseline * trendMultiplier * noise;

      costRecordsToCreate.push({
        resourceId,
        date: new Date(currentDate),
        usageQuantity: new Prisma.Decimal(dbRes.service === 'Lambda' ? randomRange(1000, 50000) : 24),
        unblendedCost: new Prisma.Decimal(dailyCost),
        currency: 'USD',
      });

      // Generate Usage Metrics (mainly for running compute, but let's seed all for structure)
      let avgCpu = null;
      let avgMem = null;
      let networkIn = null;
      let networkOut = null;

      if (dbRes.status === 'running') {
        if (meta.isPlantedIdle) {
          // low CPU for trailing days (<5%)
          avgCpu = randomRange(1.2, 3.8);
          avgMem = randomRange(10, 15);
        } else if (meta.isPlantedRightsizing) {
          // CPU 5-20%
          avgCpu = randomRange(7.5, 16.2);
          avgMem = randomRange(15, 30);
        } else if (meta.isPlantedNoCommitment) {
          // Running hot but on demand
          avgCpu = randomRange(35.0, 58.0);
          avgMem = randomRange(40, 60);
        } else {
          // Standard running resource
          avgCpu = randomRange(22.0, 75.0);
          avgMem = randomRange(30, 80);
        }
        networkIn = randomRange(1.0, 45.0);
        networkOut = randomRange(2.0, 80.0);
      } else if (dbRes.service === 'S3') {
        networkIn = randomRange(5.0, 200.0);
        networkOut = randomRange(10.0, 400.0);
      } else if (dbRes.service === 'Lambda') {
        avgCpu = randomRange(5.0, 15.0);
        avgMem = randomRange(20, 40);
        networkIn = randomRange(0.01, 1.0);
        networkOut = randomRange(0.02, 2.0);
      }

      usageMetricsToCreate.push({
        resourceId,
        date: new Date(currentDate),
        avgCpuUtil: avgCpu !== null ? new Prisma.Decimal(avgCpu) : null,
        avgMemUtil: avgMem !== null ? new Prisma.Decimal(avgMem) : null,
        networkInGb: networkIn !== null ? new Prisma.Decimal(networkIn) : null,
        networkOutGb: networkOut !== null ? new Prisma.Decimal(networkOut) : null,
      });
    }
  }

  console.log(`💾 Inserting ${costRecordsToCreate.length} cost records...`);
  // Bulk create in chunks to avoid query parameter limit errors in Postgres
  const CHUNK_SIZE = 5000;
  for (let i = 0; i < costRecordsToCreate.length; i += CHUNK_SIZE) {
    const chunk = costRecordsToCreate.slice(i, i + CHUNK_SIZE);
    await prisma.costRecord.createMany({ data: chunk });
  }

  console.log(`💾 Inserting ${usageMetricsToCreate.length} usage metrics...`);
  for (let i = 0; i < usageMetricsToCreate.length; i += CHUNK_SIZE) {
    const chunk = usageMetricsToCreate.slice(i, i + CHUNK_SIZE);
    await prisma.usageMetric.createMany({ data: chunk });
  }

  // 5. Run Recommendation Engine
  console.log('🧠 Running recommendation rules engine to analyze seeded data...');
  const recsCreated = await runRecommendationEngine(prisma);
  console.log(`Generated and saved ${recsCreated} open recommendations.`);

  // 6. Print Seeding Summary
  console.log('\n======================================================');
  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  
  const totalTeams = await prisma.team.count();
  const totalResources = await prisma.resource.count();
  const totalCosts = await prisma.costRecord.count();
  const totalUsages = await prisma.usageMetric.count();
  const openRecommendations = await prisma.recommendation.count({ where: { status: 'open' } });
  
  // Calculate total monthly spend (last 30 days)
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const totalSpendDb = await prisma.costRecord.aggregate({
    _sum: { unblendedCost: true },
    where: { date: { gte: last30Days } }
  });
  const monthlySpend = Number(totalSpendDb._sum.unblendedCost || 0);

  // Calculate potential savings
  const totalSavingsDb = await prisma.recommendation.aggregate({
    _sum: { estimatedMonthlySavings: true },
    where: { status: 'open' }
  });
  const potentialSavings = Number(totalSavingsDb._sum.estimatedMonthlySavings || 0);

  console.log(`Teams Seeded:         ${totalTeams}`);
  console.log(`Resources Seeded:     ${totalResources}`);
  console.log(`Cost Records:         ${totalCosts}`);
  console.log(`Usage Metrics:        ${totalUsages}`);
  console.log(`Open Recommendations: ${openRecommendations}`);
  console.log(`Monthly Spend (30d):  $${monthlySpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log(`Potential Savings:    $${potentialSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
