export interface ValidationDetail {
  field: string;
  message: string;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(
  value: unknown,
  minLength: number,
  maxLength: number
): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length >= minLength && trimmedValue.length <= maxLength;
}

export function isEnumValue<T extends string>(value: unknown, enumValues: readonly T[]): value is T {
  return typeof value === "string" && enumValues.includes(value as T);
}

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function isIsoDateString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const isoDateLike = /^\d{4}-\d{2}-\d{2}(T.*)?$/;
  if (!isoDateLike.test(value)) {
    return false;
  }

  const time = new Date(value).getTime();
  return !Number.isNaN(time);
}

export function parseId(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export function parsePositiveIntOrDefault(value: unknown, defaultValue: number): number {
  if (typeof value !== "string") {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return defaultValue;
  }

  return parsed;
}

export function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}
