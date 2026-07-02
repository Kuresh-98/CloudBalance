import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /costs/summary?range=30d&groupBy=service|team|region
router.get('/summary', async (req, res, next) => {
  try {
    const range = (req.query.range as string) || '30d';
    const groupBy = (req.query.groupBy as string) || 'service';
    
    const rangeDays = parseInt(range.replace('d', '')) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    const records = await prisma.costRecord.findMany({
      where: { date: { gte: startDate } },
      include: {
        resource: {
          include: { team: true }
        }
      }
    });

    const summaryMap = new Map<string, number>();
    for (const record of records) {
      let key = 'Unknown';
      if (groupBy === 'team') {
        key = record.resource?.team?.name || 'Unassigned';
      } else if (groupBy === 'region') {
        key = record.resource?.region || 'Unknown';
      } else {
        key = record.resource?.service || 'Unknown';
      }

      const cost = Number(record.unblendedCost) || 0;
      summaryMap.set(key, (summaryMap.get(key) || 0) + cost);
    }

    const data = Array.from(summaryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /costs/trend?range=90d&interval=daily|weekly
router.get('/trend', async (req, res, next) => {
  try {
    const range = (req.query.range as string) || '90d';
    const interval = (req.query.interval as string) || 'daily';
    
    const rangeDays = parseInt(range.replace('d', '')) || 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    const records = await prisma.costRecord.findMany({
      where: { date: { gte: startDate } },
    });

    const trendMap = new Map<string, number>();
    for (const record of records) {
      const d = new Date(record.date);
      let key = d.toISOString().split('T')[0];
      
      if (interval === 'weekly') {
        // Start of the week (Sunday)
        d.setDate(d.getDate() - d.getDay());
        key = d.toISOString().split('T')[0];
      }

      const cost = Number(record.unblendedCost) || 0;
      trendMap.set(key, (trendMap.get(key) || 0) + cost);
    }

    const data = Array.from(trendMap.entries())
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
