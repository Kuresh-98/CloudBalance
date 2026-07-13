import { Router } from "express";
import { Prisma, PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

function createResourceUid(service: string) {
  const prefix =
    service
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 6) || "res";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${suffix}`;
}

function parseTags(tags: unknown): Prisma.InputJsonValue | undefined {
  if (tags === null || tags === undefined) {
    return undefined;
  }

  if (typeof tags === "object") {
    return tags as Prisma.InputJsonValue;
  }

  if (typeof tags === "string") {
    try {
      return JSON.parse(tags) as Prisma.InputJsonValue;
    } catch {
      throw new Error("Invalid tags JSON");
    }
  }

  return undefined;
}

// GET /resources?team=&service=&status=&search=&page=&limit=
router.get("/", async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const teamId = req.query.team as string | undefined;
    const service = req.query.service as string | undefined;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "20");
    const skip = (page - 1) * limit;

    // Build Prisma query where clause
    const whereClause: any = {};

    if (teamId) {
      // Verify team belongs to user
      const checkTeam = await prisma.team.findFirst({
        where: { id: teamId, userId },
      });
      if (!checkTeam) {
        return res.status(404).json({ error: "Team not found" });
      }
      whereClause.teamId = teamId;
    } else {
      whereClause.team = { userId };
    }

    if (service) {
      whereClause.service = service;
    }
    if (status) {
      whereClause.status = status;
    }
    if (search) {
      whereClause.resourceUid = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Fetch resources with pagination
    const [resources, totalCount] = await prisma.$transaction([
      prisma.resource.findMany({
        where: whereClause,
        include: {
          team: {
            select: {
              name: true,
            },
          },
          usageMetrics: {
            orderBy: {
              date: "desc",
            },
            take: 1,
            select: {
              id: true,
              date: true,
              avgCpuUtil: true,
              avgMemUtil: true,
              networkInGb: true,
              networkOutGb: true,
            },
          },
          recommendations: {
            where: {
              status: "open",
            },
            select: {
              id: true,
              type: true,
              estimatedMonthlySavings: true,
            },
          },
        },
        orderBy: {
          resourceUid: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.resource.count({ where: whereClause }),
    ]);

    // Format response to include average CPU and trailing cost dynamically if needed
    // or return standard resource model
    res.json({
      resources,
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

// POST /resources
router.post("/", async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const {
      resourceUid,
      teamId,
      service,
      region,
      instanceType,
      status,
      tags,
      observedCpuUtil,
      observedMemUtil,
      observedNetworkInGb,
      observedNetworkOutGb,
    } = req.body as {
      resourceUid?: string;
      teamId?: string | null;
      service?: string;
      region?: string;
      instanceType?: string | null;
      status?: string;
      tags?: unknown;
      observedCpuUtil?: string | number | null;
      observedMemUtil?: string | number | null;
      observedNetworkInGb?: string | number | null;
      observedNetworkOutGb?: string | number | null;
    };

    if (!service?.trim() || !region?.trim() || !status?.trim()) {
      return res.status(400).json({
        error: "service, region, and status are required",
      });
    }

    if (!teamId) {
      return res.status(400).json({ error: "teamId is required for user isolation" });
    }

    // Verify team ownership
    const checkTeam = await prisma.team.findFirst({
      where: { id: teamId, userId },
    });
    if (!checkTeam) {
      return res.status(404).json({ error: "Team not found" });
    }

    const data: Prisma.ResourceUncheckedCreateInput = {
      resourceUid: resourceUid?.trim() || createResourceUid(service),
      teamId,
      service: service.trim(),
      region: region.trim(),
      instanceType: instanceType?.trim() || null,
      status: status.trim(),
    };

    const parsedTags = parseTags(tags);
    if (parsedTags !== undefined) {
      data.tags = parsedTags;
    }

    const resource = await prisma.resource.create({
      data,
    });

    const hasUsageSnapshot =
      observedCpuUtil !== undefined ||
      observedMemUtil !== undefined ||
      observedNetworkInGb !== undefined ||
      observedNetworkOutGb !== undefined;

    if (hasUsageSnapshot) {
      await prisma.usageMetric.create({
        data: {
          resourceId: resource.id,
          date: new Date(),
          avgCpuUtil:
            observedCpuUtil === undefined ||
            observedCpuUtil === null ||
            observedCpuUtil === ""
              ? null
              : observedCpuUtil,
          avgMemUtil:
            observedMemUtil === undefined ||
            observedMemUtil === null ||
            observedMemUtil === ""
              ? null
              : observedMemUtil,
          networkInGb:
            observedNetworkInGb === undefined ||
            observedNetworkInGb === null ||
            observedNetworkInGb === ""
              ? null
              : observedNetworkInGb,
          networkOutGb:
            observedNetworkOutGb === undefined ||
            observedNetworkOutGb === null ||
            observedNetworkOutGb === ""
              ? null
              : observedNetworkOutGb,
        },
      });
    }

    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
});

// GET /resources/:id
router.get("/:id", async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const resource = await prisma.resource.findFirst({
      where: {
        id,
        team: { userId },
      },
      include: {
        team: true,
        recommendations: {
          where: {
            status: "open",
          },
        },
      },
    });

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.json(resource);
  } catch (error) {
    next(error);
  }
});

// PATCH /resources/:id
router.patch("/:id", async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { resourceUid, teamId, service, region, instanceType, status, tags } =
      req.body as {
        resourceUid?: string;
        teamId?: string | null;
        service?: string;
        region?: string;
        instanceType?: string | null;
        status?: string;
        tags?: unknown;
      };

    // Verify ownership of the resource
    const checkRes = await prisma.resource.findFirst({
      where: { id, team: { userId } },
    });
    if (!checkRes) {
      return res.status(404).json({ error: "Resource not found" });
    }

    if (teamId) {
      const checkTeam = await prisma.team.findFirst({
        where: { id: teamId, userId },
      });
      if (!checkTeam) {
        return res.status(404).json({ error: "Target team not found" });
      }
    }

    const data: Prisma.ResourceUncheckedUpdateInput = {};

    if (resourceUid !== undefined) {
      data.resourceUid = resourceUid.trim();
    }
    if (teamId !== undefined) {
      data.teamId = teamId;
    }
    if (service !== undefined) {
      data.service = service.trim();
    }
    if (region !== undefined) {
      data.region = region.trim();
    }
    if (instanceType !== undefined) {
      data.instanceType = instanceType?.trim() || null;
    }
    if (status !== undefined) {
      data.status = status.trim();
    }
    if (tags !== undefined) {
      data.tags = parseTags(tags);
    }

    const resource = await prisma.resource.update({
      where: { id },
      data,
    });

    res.json(resource);
  } catch (error: any) {
    next(error);
  }
});

// DELETE /resources/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Verify ownership of the resource
    const checkRes = await prisma.resource.findFirst({
      where: { id, team: { userId } },
    });
    if (!checkRes) {
      return res.status(404).json({ error: "Resource not found" });
    }

    await prisma.resource.delete({ where: { id } });

    res.status(204).send();
  } catch (error: any) {
    next(error);
  }
});

// GET /resources/:id/usage
router.get("/:id/usage", async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Verify ownership of the resource
    const checkRes = await prisma.resource.findFirst({
      where: { id, team: { userId } },
    });
    if (!checkRes) {
      return res.status(404).json({ error: "Resource not found" });
    }

    const usage = await prisma.usageMetric.findMany({
      where: { resourceId: id },
      orderBy: { date: "asc" },
      take: 90, // Return trailing history up to 90 days
    });
    res.json(usage);
  } catch (error) {
    next(error);
  }
});

// POST /resources/:id/usage
router.post("/:id/usage", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, avgCpuUtil, avgMemUtil, networkInGb, networkOutGb } =
      req.body as {
        date?: string;
        avgCpuUtil?: string | number | null;
        avgMemUtil?: string | number | null;
        networkInGb?: string | number | null;
        networkOutGb?: string | number | null;
      };

    if (!date) {
      return res.status(400).json({ error: "date is required" });
    }

    const usageData: Prisma.UsageMetricUncheckedCreateInput = {
      resourceId: id,
      date: new Date(date),
    };

    if (avgCpuUtil !== undefined) {
      usageData.avgCpuUtil =
        avgCpuUtil === null || avgCpuUtil === "" ? null : avgCpuUtil;
    }
    if (avgMemUtil !== undefined) {
      usageData.avgMemUtil =
        avgMemUtil === null || avgMemUtil === "" ? null : avgMemUtil;
    }
    if (networkInGb !== undefined) {
      usageData.networkInGb =
        networkInGb === null || networkInGb === "" ? null : networkInGb;
    }
    if (networkOutGb !== undefined) {
      usageData.networkOutGb =
        networkOutGb === null || networkOutGb === "" ? null : networkOutGb;
    }

    const usage = await prisma.usageMetric.create({
      data: usageData,
    });

    res.status(201).json(usage);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Resource not found" });
    }

    next(error);
  }
});

// GET /resources/:id/usage/:usageId
router.get("/:id/usage/:usageId", async (req, res, next) => {
  try {
    const { usageId } = req.params;
    const usage = await prisma.usageMetric.findUnique({
      where: { id: usageId },
      include: {
        resource: true,
      },
    });

    if (!usage) {
      return res.status(404).json({ error: "Usage metric not found" });
    }

    res.json(usage);
  } catch (error) {
    next(error);
  }
});

// PATCH /resources/:id/usage/:usageId
router.patch("/:id/usage/:usageId", async (req, res, next) => {
  try {
    const { usageId } = req.params;
    const { date, avgCpuUtil, avgMemUtil, networkInGb, networkOutGb } =
      req.body as {
        date?: string;
        avgCpuUtil?: string | number | null;
        avgMemUtil?: string | number | null;
        networkInGb?: string | number | null;
        networkOutGb?: string | number | null;
      };

    const data: Prisma.UsageMetricUncheckedUpdateInput = {};

    if (date !== undefined) {
      data.date = new Date(date);
    }
    if (avgCpuUtil !== undefined) {
      data.avgCpuUtil =
        avgCpuUtil === null || avgCpuUtil === "" ? null : avgCpuUtil;
    }
    if (avgMemUtil !== undefined) {
      data.avgMemUtil =
        avgMemUtil === null || avgMemUtil === "" ? null : avgMemUtil;
    }
    if (networkInGb !== undefined) {
      data.networkInGb =
        networkInGb === null || networkInGb === "" ? null : networkInGb;
    }
    if (networkOutGb !== undefined) {
      data.networkOutGb =
        networkOutGb === null || networkOutGb === "" ? null : networkOutGb;
    }

    const usage = await prisma.usageMetric.update({
      where: { id: usageId },
      data,
    });

    res.json(usage);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Usage metric not found" });
    }

    next(error);
  }
});

// DELETE /resources/:id/usage/:usageId
router.delete("/:id/usage/:usageId", async (req, res, next) => {
  try {
    const { usageId } = req.params;

    await prisma.usageMetric.delete({ where: { id: usageId } });

    res.status(204).send();
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Usage metric not found" });
    }

    next(error);
  }
});

export default router;
