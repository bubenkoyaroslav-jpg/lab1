import { NextFunction, Request, Response } from "express";
import { createNotFoundError } from "../utils/errors";

export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction): void {
  next(createNotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}
