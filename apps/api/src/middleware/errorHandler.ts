import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('❌ Error caught by Express handler:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      message,
      status,
      // Only show details in dev environment
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
}
