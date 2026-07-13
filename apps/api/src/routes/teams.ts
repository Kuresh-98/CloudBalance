import { Router } from "express";
import { Prisma, PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

function parseMonthlyBudget(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return new Prisma.Decimal(value as string | number);
}

// GET /teams
router.get("/", async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const teams = await prisma.team.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
    res.json(teams);
  } catch (error) {
    next(error);
  }
});

// POST /teams
router.post("/", async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { name, monthlyBudget } = req.body as {
      name?: string;
      monthlyBudget?: string | number | null;
    };

    if (!name?.trim()) {
      return res.status(400).json({ error: "Team name is required" });
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        userId,
        monthlyBudget: parseMonthlyBudget(monthlyBudget),
      },
    });

    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
});

// GET /teams/leaderboard
router.get("/leaderboard", async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const now = new Date();
    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 30);

    // Fetch teams only for this user
    const teams = await prisma.team.findMany({
      where: { userId },
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
                status: "open",
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
      const efficiencyScore =
        totalSpend30d > 0
          ? Math.max(
              0,
              Math.min(
                100,
                (1 - potentialMonthlySavings / totalSpend30d) * 100,
              ),
            )
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

// GET /teams/:id
router.get("/:id", async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const team = await prisma.team.findFirst({
      where: { id, userId },
      include: {
        resources: true,
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    next(error);
  }
});

// PATCH /teams/:id
router.patch("/:id", async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { name, monthlyBudget } = req.body as {
      name?: string;
      monthlyBudget?: string | number | null;
    };

    // Verify ownership
    const checkTeam = await prisma.team.findFirst({
      where: { id, userId },
    });
    if (!checkTeam) {
      return res.status(404).json({ error: "Team not found" });
    }

    const team = await prisma.team.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(monthlyBudget !== undefined
          ? { monthlyBudget: parseMonthlyBudget(monthlyBudget) }
          : {}),
      },
    });

    res.json(team);
  } catch (error: any) {
    next(error);
  }
});

// DELETE /teams/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Verify ownership
    const checkTeam = await prisma.team.findFirst({
      where: { id, userId },
    });
    if (!checkTeam) {
      return res.status(404).json({ error: "Team not found" });
    }

    await prisma.team.delete({ where: { id } });

    res.status(204).send();
  } catch (error: any) {
    next(error);
  }
});

export default router;
