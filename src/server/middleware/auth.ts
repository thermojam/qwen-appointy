import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {UserRole} from '@prisma/client';
import {AppError} from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

export interface JwtPayload {
    userId: string;
    role: UserRole;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const generateAccessToken = (userId: string, role: UserRole): string => {
    return jwt.sign({userId, role}, JWT_SECRET, {expiresIn: '15m'});
};

export const generateRefreshToken = (userId: string, role: UserRole): string => {
    return jwt.sign({userId, role}, JWT_REFRESH_SECRET, {expiresIn: '7d'});
};

export const verifyAccessToken = (token: string): JwtPayload => {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        throw AppError.unauthorized('Invalid or expired access token');
    }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
        throw AppError.unauthorized('Invalid or expired refresh token');
    }
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw AppError.unauthorized('Authorization header required');
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    req.user = payload;
    next();
};

export const authorize = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw AppError.unauthorized('Authentication required');
        }

        if (!roles.includes(req.user.role)) {
            throw AppError.forbidden('Insufficient permissions');
        }

        next();
    };
};
