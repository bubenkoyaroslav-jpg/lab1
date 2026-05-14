import { NextFunction, Request, Response } from "express";
import { AppError, ErrorResponseBody } from "../utils/errors";

export function errorHandlerMiddleware(
  error: unknown,
  _req: Request,
  res: Response<ErrorResponseBody>,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
      details: []
    }
  });
}
