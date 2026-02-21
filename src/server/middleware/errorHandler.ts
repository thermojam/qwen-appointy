import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { AppError } from '../utils/errors';

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const successResponse = <T>(res: Response, data: T, statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  } as ApiResponse<T>);
};

export const errorResponse = (
  res: Response,
  error: AppError | Error,
  defaultStatus: number = 500
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
    } as ApiResponse);
  }

  return res.status(defaultStatus).json({
    success: false,
    error: error.message || 'Internal Server Error',
    code: 'INTERNAL_ERROR',
  } as ApiResponse);
};

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Global Error Handler]:', err);
  errorResponse(res, err);
};
