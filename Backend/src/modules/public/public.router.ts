import { Router } from "express";
import { PortfolioStatus } from "@prisma/client";

import { prisma } from "../../db/prisma";

export const publicRouter = Router();

publicRouter.get("/:slug", async (req, res, next) => {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        slug: req.params.slug,
        status: PortfolioStatus.PUBLISHED,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        data: true,
        publishedAt: true,
        updatedAt: true,
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