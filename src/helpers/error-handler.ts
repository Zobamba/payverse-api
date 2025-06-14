import { Request, Response, NextFunction } from "express";

const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = error.status || 500;
  const message = error.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    status,
    message,
    errors: error.errors || null,
  });
};

export default errorHandler;
