import { prisma } from '../db/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { UserRole, AccountStatus } from '@prisma/client';

interface RegisterInput {
  email: string;
  password: string;
  role: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async register({ email, password, role }: RegisterInput): Promise<TokenPair> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw AppError.conflict('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        status: AccountStatus.ACTIVE,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { accessToken, refreshToken };
  },

  async login({ email, password }: LoginInput): Promise<TokenPair> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw AppError.forbidden('Account is not active');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  },

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord) {
      throw AppError.unauthorized('Refresh token not found');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw AppError.unauthorized('Refresh token expired');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.status !== AccountStatus.ACTIVE) {
      throw AppError.unauthorized('User not found or inactive');
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    // Generate new tokens
    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id, user.role);

    // Save new refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  },

  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },
};
