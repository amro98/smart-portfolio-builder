import { Router } from "express";
import { PortfolioStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "../../db/prisma";
import { getAuthenticatedUserId, requireAuth } from "../auth/auth.middleware";

export const portfoliosRouter = Router();

portfoliosRouter.use(requireAuth);

const slugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const createPortfolioSchema = z.object({
  name: z.string().min(1).max(120),
  slug: slugSchema.optional(),
  data: z.unknown().optional(),
});

const updatePortfolioSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: slugSchema.optional(),
  data: z.unknown().optional(),
});

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function getUniqueSlug(baseSlug: string) {
  let slug = normalizeSlug(baseSlug) || "portfolio";
  let counter = 1;

  while (true) {
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingPortfolio) {
      return slug;
    }

    counter += 1;
    slug = `${normalizeSlug(baseSlug) || "portfolio"}-${counter}`;
  }
}

portfoliosRouter.get("/", async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({
      portfolios,
    });
  } catch (error) {
    return next(error);
  }
});

portfoliosRouter.post("/", async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const body = createPortfolioSchema.parse(req.body);

    const slug = body.slug ?? (await getUniqueSlug(body.name));

    if (body.slug) {
      const existingPortfolio = await prisma.portfolio.findUnique({
        where: { slug: body.slug },
        select: { id: true },
      });

      if (existingPortfolio) {
        return res.status(409).json({
          error: "Slug is already taken",
        });
      }
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name: body.name,
        slug,
        data: (body.data ?? {}) as Prisma.InputJsonValue,
      },
    });

    return res.status(201).json({
      portfolio,
    });
  } catch (error) {
    return next(error);
  }
});

portfoliosRouter.get("/:id", async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (!portfolio) {
      return res.status(404).json({
        error: "Portfolio not found",
      });
    }

    return res.json({
      portfolio,
    });
  } catch (error) {
    return next(error);
  }
});

portfoliosRouter.patch("/:id", async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const body = updatePortfolioSchema.parse(req.body);

    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (!existingPortfolio) {
      return res.status(404).json({
        error: "Portfolio not found",
      });
    }

    if (body.slug && body.slug !== existingPortfolio.slug) {
      const portfolioWithSameSlug = await prisma.portfolio.findUnique({
        where: { slug: body.slug },
        select: { id: true },
      });

      if (portfolioWithSameSlug) {
        return res.status(409).json({
          error: "Slug is already taken",
        });
      }
    }

    const updateData: Prisma.PortfolioUpdateInput = {};

    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    if (body.slug !== undefined) {
      updateData.slug = body.slug;
    }

    if (body.data !== undefined) {
      updateData.data = body.data as Prisma.InputJsonValue;
    }

    const portfolio = await prisma.portfolio.update({
      where: { id: existingPortfolio.id },
      data: updateData,
    });

    return res.json({
      portfolio,
    });
  } catch (error) {
    return next(error);
  }
});

portfoliosRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (!existingPortfolio) {
      return res.status(404).json({
        error: "Portfolio not found",
      });
    }

    await prisma.portfolio.delete({
      where: { id: existingPortfolio.id },
    });

    return res.json({
      ok: true,
    });
  } catch (error) {
    return next(error);
  }
});

portfoliosRouter.post("/:id/publish", async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (!existingPortfolio) {
      return res.status(404).json({
        error: "Portfolio not found",
      });
    }

    const portfolio = await prisma.portfolio.update({
      where: { id: existingPortfolio.id },
      data: {
        status: PortfolioStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    return res.json({
      portfolio,
    });
  } catch (error) {
    return next(error);
  }
});