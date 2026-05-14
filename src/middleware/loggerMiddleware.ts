import { NextFunction, Request, Response } from "express";

export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on("finish", () => {
    const responseTime = Date.now() - startTime;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`);
  });

  next();
}
