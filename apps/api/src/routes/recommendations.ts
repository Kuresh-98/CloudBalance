import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /recommendations?status=open&type=&sort=savings&page=&limit=
router.get("/", async (req, res, next) => {
  try {
    const status = (req.query.status as string) || "open";
    const type = req.query.type as string | undefined;
    const sort = req.query.sort as string | undefined;
    const teamId = req.query.team as string | undefined;

    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "20");
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (status !== "all") {
      whereClause.status = status;
    }
    if (type) {
      whereClause.type = type;
    }
    if (teamId) {
      whereClause.resource = { teamId };
    }

    // Determine sorting
    let orderBy: any = { createdAt: "desc" };
    if (sort === "savings") {
      orderBy = { estimatedMonthlySavings: "desc" };
    }

    const [recommendations, totalCount] = await prisma.$transaction([
      prisma.recommendation.findMany({
        where: whereClause,
        include: {
          resource: {
            include: {
              team: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.recommendation.count({ where: whereClause }),
    ]);

    res.json({
      recommendations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /recommendations
router.post("/", async (req, res, next) => {
  try {
    const {
      resourceId,
      type,
      title,
      rationale,
      estimatedMonthlySavings,
      confidence,
      status,
    } = req.body as {
      resourceId?: string | null;
      type?: string;
      title?: string;
      rationale?: string;
      estimatedMonthlySavings?: string | number;
      confidence?: string;
      status?: string | null;
    };

    if (
      !type?.trim() ||
      !title?.trim() ||
      !rationale?.trim() ||
      estimatedMonthlySavings === undefined ||
      !confidence?.trim()
    ) {
      return res
        .status(400)
        .json({
          error:
            "type, title, rationale, estimatedMonthlySavings, and confidence are required",
        });
    }

    const recommendation = await prisma.recommendation.create({
      data: {
        resourceId: resourceId ?? null,
        type: type.trim(),
        title: title.trim(),
        rationale: rationale.trim(),
        estimatedMonthlySavings,
        confidence: confidence.trim(),
        status: status ?? undefined,
      },
    });

    res.status(201).json(recommendation);
  } catch (error) {
    next(error);
  }
});

// GET /recommendations/summary
router.get("/summary", async (req, res, next) => {
  try {
    const aggregations = await prisma.recommendation.aggregate({
      where: {
        status: "open",
      },
      _sum: {
        estimatedMonthlySavings: true,
      },
      _count: {
        id: true,
      },
    });

    res.json({
      count: aggregations._count.id || 0,
      potentialMonthlySavings: Number(
        aggregations._sum.estimatedMonthlySavings || 0,
      ),
    });
  } catch (error) {
    next(error);
  }
});

// GET /recommendations/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const recommendation = await prisma.recommendation.findUnique({
      where: { id },
      include: {
        resource: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!recommendation) {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    res.json(recommendation);
  } catch (error) {
    next(error);
  }
});

// PATCH /recommendations/:id
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      resourceId,
      type,
      title,
      rationale,
      estimatedMonthlySavings,
      confidence,
      status,
    } = req.body as {
      resourceId?: string | null;
      type?: string;
      title?: string;
      rationale?: string;
      estimatedMonthlySavings?: string | number;
      confidence?: string;
      status?: string | null;
    };

    const recommendation = await prisma.recommendation.update({
      where: { id },
      data: {
        ...(resourceId !== undefined ? { resourceId } : {}),
        ...(type !== undefined ? { type: type.trim() } : {}),
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(rationale !== undefined ? { rationale: rationale.trim() } : {}),
        ...(estimatedMonthlySavings !== undefined
          ? { estimatedMonthlySavings }
          : {}),
        ...(confidence !== undefined ? { confidence: confidence.trim() } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    });

    res.json(recommendation);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    next(error);
  }
});

// DELETE /recommendations/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.recommendation.delete({ where: { id } });

    res.status(204).send();
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    next(error);
  }
});

// POST /recommendations/:id/apply
router.post("/:id/apply", async (req, res, next) => {
  try {
    const { id } = req.params;
    const rec = await prisma.recommendation.findUnique({ where: { id } });

    if (!rec) {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    // For the mock apply action, update the status to "applied"
    const updated = await prisma.recommendation.update({
      where: { id },
      data: { status: "applied" },
    });

    // Also simulate update to the linked resource if applicable (e.g. status = idle -> status = terminated)
    if (rec.resourceId) {
      if (rec.type === "idle_termination") {
        await prisma.resource.update({
          where: { id: rec.resourceId },
          data: { status: "terminated" },
        });
      } else if (
        rec.type === "unattached_storage" ||
        rec.type === "stale_snapshot"
      ) {
        await prisma.resource.update({
          where: { id: rec.resourceId },
          data: { status: "deleted" },
        });
      } else if (rec.type === "unused_ip") {
        await prisma.resource.update({
          where: { id: rec.resourceId },
          data: { status: "released" },
        });
      }
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// POST /recommendations/:id/reopen
router.post("/:id/reopen", async (req, res, next) => {
  try {
    const { id } = req.params;
    const rec = await prisma.recommendation.findUnique({ where: { id } });

    if (!rec) {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    const updated = await prisma.recommendation.update({
      where: { id },
      data: { status: "open" },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// POST /recommendations/:id/dismiss
router.post("/:id/dismiss", async (req, res, next) => {
  try {
    const { id } = req.params;
    const rec = await prisma.recommendation.findUnique({ where: { id } });

    if (!rec) {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    const updated = await prisma.recommendation.update({
      where: { id },
      data: { status: "dismissed" },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
