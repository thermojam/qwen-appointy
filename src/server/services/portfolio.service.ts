import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';

interface CreatePortfolioInput {
  masterId: string;
  imageUrl: string;
  title?: string;
  description?: string;
}

interface UpdatePortfolioInput {
  title?: string;
  description?: string;
}

export const portfolioService = {
  async createPortfolio(data: CreatePortfolioInput) {
    // Verify master exists
    const master = await prisma.master.findUnique({
      where: { id: data.masterId },
    });

    if (!master) {
      throw AppError.notFound('Master not found');
    }

    const portfolio = await prisma.portfolioWork.create({
      data: {
        masterId: data.masterId,
        imageUrl: data.imageUrl,
        title: data.title,
        description: data.description,
      },
    });

    return portfolio;
  },

  async updatePortfolio(portfolioId: string, data: UpdatePortfolioInput) {
    const portfolio = await prisma.portfolioWork.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      throw AppError.notFound('Portfolio item not found');
    }

    const updated = await prisma.portfolioWork.update({
      where: { id: portfolioId },
      data,
    });

    return updated;
  },

  async deletePortfolio(portfolioId: string) {
    const portfolio = await prisma.portfolioWork.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      throw AppError.notFound('Portfolio item not found');
    }

    await prisma.portfolioWork.delete({
      where: { id: portfolioId },
    });
  },

  async getPortfolioByMaster(masterId: string) {
    const portfolio = await prisma.portfolioWork.findMany({
      where: { masterId },
      orderBy: { createdAt: 'desc' },
    });

    return portfolio;
  },

  async getPortfolioById(portfolioId: string) {
    const portfolio = await prisma.portfolioWork.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      throw AppError.notFound('Portfolio item not found');
    }

    return portfolio;
  },

  async reorderPortfolio(masterId: string, portfolioIds: string[]) {
    // Update order based on array of IDs
    const updates = portfolioIds.map((id, index) =>
      prisma.portfolioWork.update({
        where: { id },
        data: { createdAt: new Date(Date.now() - (portfolioIds.length - index) * 1000) },
      })
    );

    await prisma.$transaction(updates);

    return this.getPortfolioByMaster(masterId);
  },
};
