import { NextFunction, Request, Response } from "express";
import { UserListQuery, userService } from "../services/userService";
import { createValidationError } from "../utils/errors";
import { parseId } from "../utils/validation";

interface IdParams {
  id: string;
}

function getIdFromParams(idValue: string): number {
  const parsedId = parseId(idValue);

  if (parsedId === null) {
    throw createValidationError([{ field: "id", message: "id must be a positive integer." }]);
  }

  return parsedId;
}

export function getUsers(
  req: Request<Record<string, never>, Record<string, never>, Record<string, never>, UserListQuery>,
  res: Response,
  next: NextFunction
): void {
  try {
    const users = userService.getAll(req.query);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

export function getUserById(req: Request<IdParams>, res: Response, next: NextFunction): void {
  try {
    const id = getIdFromParams(req.params.id);
    const user = userService.getById(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export function createUser(
  req: Request<Record<string, never>, Record<string, never>, unknown>,
  res: Response,
  next: NextFunction
): void {
  try {
    const createdUser = userService.create(req.body);
    res.status(201).json(createdUser);
  } catch (error) {
    next(error);
  }
}

export function replaceUser(
  req: Request<IdParams, Record<string, never>, unknown>,
  res: Response,
  next: NextFunction
): void {
  try {
    const id = getIdFromParams(req.params.id);
    const updatedUser = userService.replace(id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
}

export function patchUser(
  req: Request<IdParams, Record<string, never>, unknown>,
  res: Response,
  next: NextFunction
): void {
  try {
    const id = getIdFromParams(req.params.id);
    const patchedUser = userService.patch(id, req.body);
    res.status(200).json(patchedUser);
  } catch (error) {
    next(error);
  }
}

export function deleteUser(req: Request<IdParams>, res: Response, next: NextFunction): void {
  try {
    const id = getIdFromParams(req.params.id);
    userService.delete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
