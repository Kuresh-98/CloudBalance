import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /teams
router.get('/', async (req, res, next) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(teams);
  } catch (error) {
    next(error);
  }
});

// GET /teams/leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const now = new Date();
    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 30);

    // Fetch teams
    const teams = await prisma.team.findMany({
      include: {
        resources: {
          include: {
            costRecords: {
              where: {
                date: { gte: last30Days },
              },
            },
            recommendations: {
              where: {
                status: 'open',
              },
            },
          },
        },
      },
    });

    // Compute metrics for each team
    const leaderboard = teams.map((team) => {
      let totalSpend30d = 0;
      let openRecommendationsCount = 0;
      let potentialMonthlySavings = 0;

      for (const res of team.resources) {
        // Sum cost
        for (const cost of res.costRecords) {
          totalSpend30d += Number(cost.unblendedCost);
        }
        // Sum open recommendations
        for (const rec of res.recommendations) {
          openRecommendationsCount++;
          potentialMonthlySavings += Number(rec.estimatedMonthlySavings);
        }
      }

      // Cost efficiency score: 100% is perfect (0 savings opportunity), drops as waste increases
      const efficiencyScore = totalSpend30d > 0
        ? Math.max(0, Math.min(100, (1 - (potentialMonthlySavings / totalSpend30d)) * 100))
        : 100; // if spend is 0, they are 100% efficient

      return {
        id: team.id,
        name: team.name,
        monthlyBudget: team.monthlyBudget ? Number(team.monthlyBudget) : null,
        totalSpend30d: parseFloat(totalSpend30d.toFixed(2)),
        openRecommendationsCount,
        potentialMonthlySavings: parseFloat(potentialMonthlySavings.toFixed(2)),
        efficiencyScore: parseFloat(efficiencyScore.toFixed(1)),
      };
    });

    // Sort by efficiency score descending (most efficient first)
    leaderboard.sort((a, b) => b.efficiencyScore - a.efficiencyScore);

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

export default router;
