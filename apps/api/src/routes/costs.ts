import { Router } from "express";
import { Prisma, PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

function parseDecimal(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return new Prisma.Decimal(value as string | number);
}

// GET /costs/summary?range=30d&groupBy=service|team|region
router.get("/summary", async (req, res, next) => {
  try {
    const range = (req.query.range as string) || "30d";
    const groupBy = (req.query.groupBy as string) || "service";
    const teamId = req.query.team as string | undefined;

    const rangeDays = parseInt(range.replace("d", "")) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    const records = await prisma.costRecord.findMany({
      where: {
        date: { gte: startDate },
        ...(teamId ? { resource: { teamId } } : {}),
      },
      include: {
        resource: {
          include: { team: true },
        },
      },
    });

    const summaryMap = new Map<string, number>();
    for (const record of records) {
      let key = "Unknown";
      if (groupBy === "team") {
        key = record.resource?.team?.name || "Unassigned";
      } else if (groupBy === "region") {
        key = record.resource?.region || "Unknown";
      } else {
        key = record.resource?.service || "Unknown";
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
router.get("/trend", async (req, res, next) => {
  try {
    const range = (req.query.range as string) || "90d";
    const interval = (req.query.interval as string) || "daily";
    const teamId = req.query.team as string | undefined;

    const rangeDays = parseInt(range.replace("d", "")) || 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    const records = await prisma.costRecord.findMany({
      where: {
        date: { gte: startDate },
        ...(teamId ? { resource: { teamId } } : {}),
      },
    });

    const trendMap = new Map<string, number>();
    for (const record of records) {
      const d = new Date(record.date);
      let key = d.toISOString().split("T")[0];

      if (interval === "weekly") {
        // Start of the week (Sunday)
        d.setDate(d.getDate() - d.getDay());
        key = d.toISOString().split("T")[0];
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

// POST /costs
router.post("/", async (req, res, next) => {
  try {
    const { resourceId, date, usageQuantity, unblendedCost, currency } =
      req.body as {
        resourceId?: string | null;
        date?: string;
        usageQuantity?: string | number | null;
        unblendedCost?: string | number;
        currency?: string | null;
      };

    if (
      !date ||
      unblendedCost === undefined ||
      unblendedCost === null ||
      unblendedCost === ""
    ) {
      return res
        .status(400)
        .json({ error: "date and unblendedCost are required" });
    }

    const cost = await prisma.costRecord.create({
      data: {
        resourceId: resourceId ?? null,
        date: new Date(date),
        usageQuantity: parseDecimal(usageQuantity),
        unblendedCost,
        currency: currency ?? "USD",
      },
    });

    res.status(201).json(cost);
  } catch (error) {
    next(error);
  }
});

// GET /costs/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const cost = await prisma.costRecord.findUnique({
      where: { id },
      include: {
        resource: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!cost) {
      return res.status(404).json({ error: "Cost record not found" });
    }

    res.json(cost);
  } catch (error) {
    next(error);
  }
});

// PATCH /costs/:id
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resourceId, date, usageQuantity, unblendedCost, currency } =
      req.body as {
        resourceId?: string | null;
        date?: string;
        usageQuantity?: string | number | null;
        unblendedCost?: string | number;
        currency?: string | null;
      };

    const cost = await prisma.costRecord.update({
      where: { id },
      data: {
        ...(resourceId !== undefined ? { resourceId } : {}),
        ...(date !== undefined ? { date: new Date(date) } : {}),
        ...(usageQuantity !== undefined
          ? { usageQuantity: parseDecimal(usageQuantity) }
          : {}),
        ...(unblendedCost !== undefined ? { unblendedCost } : {}),
        ...(currency !== undefined ? { currency } : {}),
      },
    });

    res.json(cost);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Cost record not found" });
    }

    next(error);
  }
});

// DELETE /costs/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.costRecord.delete({ where: { id } });

    res.status(204).send();
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Cost record not found" });
    }

    next(error);
  }
});

export default router;
