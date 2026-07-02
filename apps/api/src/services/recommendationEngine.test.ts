import { describe, it, expect } from 'vitest';
import { generateRecommendationsForResource, RecommendationInput } from './recommendationEngine';

describe('Recommendation Engine Rules', () => {
  // Helper to create a base mock resource
  const createMockResource = (overrides: Partial<RecommendationInput> = {}): RecommendationInput => {
    return {
      id: 'res-123',
      resourceId: 'res-123',
      resourceUid: 'i-0a1b2c3d',
      service: 'EC2',
      status: 'running',
      createdAt: new Date(),
      tags: { owner: 'platform-team', team: 'platform' },
      instanceType: 't3.medium',
      teamId: 'team-123',
      usageMetrics: [],
      costRecords: [],
      ...overrides,
    };
  };

  // Helper to populate 14 days of average CPU metrics
  const createCpuMetrics = (cpuValues: number[]): { date: Date; avgCpuUtil: number; avgMemUtil: number; networkInGb: number; networkOutGb: number }[] => {
    return cpuValues.map((val, index) => ({
      date: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
      avgCpuUtil: val,
      avgMemUtil: 50,
      networkInGb: 1,
      networkOutGb: 1,
    }));
  };

  it('should flag idle compute when CPU is below 5% for running EC2/RDS', () => {
    const resource = createMockResource({
      service: 'EC2',
      status: 'running',
      usageMetrics: createCpuMetrics([2, 3, 2, 4, 3, 1, 2, 3, 2, 1, 2, 3, 2, 2]),
      costRecords: [{ date: new Date(), unblendedCost: 10 }], // $10 per day -> ~$300/month
    });

    const recommendations = generateRecommendationsForResource(resource);
    const idleRec = recommendations.find(r => r.type === 'idle_termination');

    expect(idleRec).toBeDefined();
    expect(idleRec?.title).toBe('Terminate Idle EC2 Instance');
    expect(idleRec?.estimatedMonthlySavings).toBe(300); // 100% of $300
    expect(idleRec?.confidence).toBe('high');
  });

  it('should flag rightsizing when CPU is between 5% and 20% for running EC2/RDS', () => {
    const resource = createMockResource({
      service: 'RDS',
      status: 'running',
      usageMetrics: createCpuMetrics([10, 12, 15, 8, 11, 14, 13, 9, 11, 12, 10, 11, 14, 12]),
      costRecords: [{ date: new Date(), unblendedCost: 20 }], // $20/day -> ~$600/month
    });

    const recommendations = generateRecommendationsForResource(resource);
    const rightsizingRec = recommendations.find(r => r.type === 'rightsizing');

    expect(rightsizingRec).toBeDefined();
    expect(rightsizingRec?.title).toBe('Downsize RDS Instance');
    expect(rightsizingRec?.estimatedMonthlySavings).toBe(240); // 40% of $600
    expect(rightsizingRec?.confidence).toBe('medium');
  });

  it('should flag unattached storage when EBS volume status is unattached', () => {
    const resource = createMockResource({
      service: 'EBS',
      status: 'unattached',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // created 10 days ago
      costRecords: [{ date: new Date(), unblendedCost: 1.5 }], // $1.5/day -> ~$45/month
    });

    const recommendations = generateRecommendationsForResource(resource);
    const unattachedRec = recommendations.find(r => r.type === 'unattached_storage');

    expect(unattachedRec).toBeDefined();
    expect(unattachedRec?.title).toBe('Delete Unattached EBS Volume');
    expect(unattachedRec?.estimatedMonthlySavings).toBe(45);
    expect(unattachedRec?.confidence).toBe('high');
  });

  it('should flag stale snapshot when snapshot is older than 90 days', () => {
    const resource = createMockResource({
      service: 'Snapshot',
      status: 'completed',
      createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days old
      costRecords: [{ date: new Date(), unblendedCost: 0.5 }], // $0.5/day -> ~$15/month
    });

    const recommendations = generateRecommendationsForResource(resource);
    const staleSnapshotRec = recommendations.find(r => r.type === 'stale_snapshot');

    expect(staleSnapshotRec).toBeDefined();
    expect(staleSnapshotRec?.title).toBe('Delete Stale Snapshot');
    expect(staleSnapshotRec?.estimatedMonthlySavings).toBe(15);
    expect(staleSnapshotRec?.confidence).toBe('high');
  });

  it('should recommend reserved instances when EC2/RDS runs > 30 days and is not idle', () => {
    const resource = createMockResource({
      service: 'EC2',
      status: 'running',
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days old
      usageMetrics: createCpuMetrics([45, 50, 42, 60, 48, 52, 47, 55, 50, 48, 52, 45, 50, 48]), // high cpu
      costRecords: [{ date: new Date(), unblendedCost: 15 }], // $15/day -> ~$450/month
    });

    const recommendations = generateRecommendationsForResource(resource);
    const riRec = recommendations.find(r => r.type === 'reserved_instance');

    expect(riRec).toBeDefined();
    expect(riRec?.title).toBe('Purchase Reserved Instance for EC2');
    expect(riRec?.estimatedMonthlySavings).toBe(135); // 30% of $450
    expect(riRec?.confidence).toBe('medium');
  });

  it('should flag unused IPs for Elastic IPs that are unattached/idle', () => {
    const resource = createMockResource({
      service: 'ElasticIP',
      status: 'idle',
    });

    const recommendations = generateRecommendationsForResource(resource);
    const ipRec = recommendations.find(r => r.type === 'unused_ip');

    expect(ipRec).toBeDefined();
    expect(ipRec?.title).toBe('Release Unused Elastic IP');
    expect(ipRec?.estimatedMonthlySavings).toBe(3.6); // fixed savings of 3.60
  });

  it('should flag untagged resources when owner or team tag is missing', () => {
    const resource = createMockResource({
      service: 'EC2',
      tags: { env: 'prod' }, // missing owner and team
    });

    const recommendations = generateRecommendationsForResource(resource);
    const untaggedRec = recommendations.find(r => r.type === 'untagged');

    expect(untaggedRec).toBeDefined();
    expect(untaggedRec?.title).toBe('Apply Ownership Tags');
    expect(untaggedRec?.estimatedMonthlySavings).toBe(0);
  });
});
