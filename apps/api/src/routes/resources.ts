import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /resources?team=&service=&status=&search=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const teamId = req.query.team as string | undefined;
    const service = req.query.service as string | undefined;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '20');
    const skip = (page - 1) * limit;

    // Build Prisma query where clause
    const whereClause: any = {};
    
    if (teamId) {
      whereClause.teamId = teamId;
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
        mode: 'insensitive',
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
          recommendations: {
            where: {
              status: 'open',
            },
            select: {
              id: true,
              type: true,
              estimatedMonthlySavings: true,
            },
          },
        },
        orderBy: {
          resourceUid: 'asc',
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

// GET /resources/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        team: true,
        recommendations: {
          where: {
            status: 'open',
          },
        },
      },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    next(error);
  }
});

// GET /resources/:id/usage
router.get('/:id/usage', async (req, res, next) => {
  try {
    const { id } = req.params;
    const usage = await prisma.usageMetric.findMany({
      where: { resourceId: id },
      orderBy: { date: 'asc' },
      take: 90, // Return trailing history up to 90 days
    });
    res.json(usage);
  } catch (error) {
    next(error);
  }
});

export default router;
