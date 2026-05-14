export interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown[];

  constructor(statusCode: number, code: string, message: string, details: unknown[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function createValidationError(details: unknown[], message = "Invalid request body"): AppError {
  return new AppError(400, "VALIDATION_ERROR", message, details);
}

export function createNotFoundError(message: string): AppError {
  return new AppError(404, "NOT_FOUND", message, []);
}
