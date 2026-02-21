import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators';
import { authenticate } from '../middleware/auth';
import { prisma } from '../db/prisma';

const router = Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const tokens = await authService.register(data);
    successResponse(res, tokens, 201);
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const tokens = await authService.login(data);
    successResponse(res, tokens);
  })
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const tokens = await authService.refreshTokens(refreshToken);
    successResponse(res, tokens);
  })
);

router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    successResponse(res, { message: 'Logged out successfully' });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        master: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    successResponse(res, user);
  })
);

export default router;
