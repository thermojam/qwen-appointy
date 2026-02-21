import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { searchService } from '../services/search.service';
import { searchMastersSchema } from '../validators';
import { AppError } from '../utils/errors';

const router = Router();

// Search masters
router.get(
  '/masters',
  asyncHandler(async (req, res) => {
    const query = req.query as any;
    
    // Parse query parameters
    const data = searchMastersSchema.parse({
      query: query.query,
      workFormat: query.workFormat,
      minRating: query.minRating ? parseFloat(query.minRating) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
      serviceId: query.serviceId,
      sortBy: query.sortBy || 'rating',
      sortOrder: query.sortOrder || 'desc',
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      latitude: query.latitude ? parseFloat(query.latitude) : undefined,
      longitude: query.longitude ? parseFloat(query.longitude) : undefined,
    });

    const result = await searchService.searchMasters(data);
    successResponse(res, result);
  })
);

// Get master by ID
router.get(
  '/masters/:id',
  asyncHandler(async (req, res) => {
    const master = await searchService.getMasterById(String(req.params.id));

    if (!master) {
      throw AppError.notFound('Master not found');
    }

    successResponse(res, master);
  })
);

export default router;
