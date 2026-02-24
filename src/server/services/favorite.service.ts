import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';

interface GetFavoritesOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export const favoriteService = {
  /**
   * Получить все избранные мастера клиента
   */
  async getFavorites(clientId: string, options: GetFavoritesOptions = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy: Record<string, any> = {};
    switch (sortBy) {
      case 'rating':
        orderBy.master = { rating: sortOrder };
        break;
      case 'name':
        orderBy.master = { fullName: sortOrder };
        break;
      default:
        orderBy.createdAt = sortOrder;
    }

    const [favorites, total] = await Promise.all([
      prisma.favoriteMaster.findMany({
        where: { clientId },
        include: {
          master: {
            include: {
              services: {
                where: { isActive: true },
                select: {
                  id: true,
                  name: true,
                  price: true,
                  duration: true,
                },
              },
              reviews: {
                select: {
                  rating: true,
                },
                take: 5,
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.favoriteMaster.count({ where: { clientId } }),
    ]);

    return {
      data: favorites.map((f) => f.master),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Добавить мастера в избранное
   */
  async addToFavorites(clientId: string, masterId: string) {
    // Проверка существования мастера
    const master = await prisma.master.findUnique({
      where: { id: masterId },
    });

    if (!master) {
      throw AppError.notFound('Master not found');
    }

    // Проверка на дубликат
    const existing = await prisma.favoriteMaster.findUnique({
      where: {
        masterId_clientId: {
          masterId,
          clientId,
        },
      },
    });

    if (existing) {
      throw AppError.conflict('Master already in favorites');
    }

    const favorite = await prisma.favoriteMaster.create({
      data: {
        masterId,
        clientId,
      },
      include: {
        master: true,
      },
    });

    console.log('[FavoriteService] Added to favorites:', {
      clientId,
      masterId,
      favoriteId: favorite.id,
    });

    return favorite;
  },

  /**
   * Удалить мастера из избранного
   */
  async removeFromFavorites(clientId: string, masterId: string) {
    const favorite = await prisma.favoriteMaster.findUnique({
      where: {
        masterId_clientId: {
          masterId,
          clientId,
        },
      },
    });

    if (!favorite) {
      throw AppError.notFound('Favorite not found');
    }

    await prisma.favoriteMaster.delete({
      where: {
        masterId_clientId: {
          masterId,
          clientId,
        },
      },
    });

    console.log('[FavoriteService] Removed from favorites:', {
      clientId,
      masterId,
    });
  },

  /**
   * Проверить, в избранном ли мастер
   */
  async isFavorite(clientId: string, masterId: string): Promise<boolean> {
    const favorite = await prisma.favoriteMaster.findUnique({
      where: {
        masterId_clientId: {
          masterId,
          clientId,
        },
      },
    });
    return !!favorite;
  },

  /**
   * Toggle: добавить или удалить из избранного
   */
  async toggleFavorite(clientId: string, masterId: string) {
    const favorite = await prisma.favoriteMaster.findUnique({
      where: {
        masterId_clientId: {
          masterId,
          clientId,
        },
      },
    });

    if (favorite) {
      await this.removeFromFavorites(clientId, masterId);
      return { added: false };
    } else {
      await this.addToFavorites(clientId, masterId);
      return { added: true };
    }
  },
};
