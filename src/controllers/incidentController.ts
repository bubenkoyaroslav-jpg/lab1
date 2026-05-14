import { NextFunction, Request, Response } from "express";
import { IncidentListQuery, incidentService } from "../services/incidentService";
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

export function getIncidents(
  req: Request<
    Record<string, never>,
    Record<string, never>,
    Record<string, never>,
    IncidentListQuery
  >,
  res: Response,
  next: NextFunction
): void {
  try {
    const incidents = incidentService.getAll(req.query);
    res.status(200).json(incidents);
  } catch (error) {
    next(error);
  }
}

export function getIncidentById(req: Request<IdParams>, res: Response, next: NextFunction): void {
  try {
    const id = getIdFromParams(req.params.id);
    const incident = incidentService.getById(id);
    res.status(200).json(incident);
  } catch (error) {
    next(error);
  }
}

export function createIncident(
  req: Request<Record<string, never>, Record<string, never>, unknown>,
  res: Response,
  next: NextFunction
): void {
  try {
    const createdIncident = incidentService.create(req.body);
    res.status(201).json(createdIncident);
  } catch (error) {
    next(error);
  }
}

export function replaceIncident(
  req: Request<IdParams, Record<string, never>, unknown>,
  res: Response,
  next: NextFunction
): void {
  try {
    const id = getIdFromParams(req.params.id);
    const updatedIncident = incidentService.replace(id, req.body);
    res.status(200).json(updatedIncident);
  } catch (error) {
    next(error);
  }
}

export function patchIncident(
  req: Request<IdParams, Record<string, never>, unknown>,
  res: Response,
  next: NextFunction
): void {
  try {
    const id = getIdFromParams(req.params.id);
    const patchedIncident = incidentService.patch(id, req.body);
    res.status(200).json(patchedIncident);
  } catch (error) {
    next(error);
  }
}

export function deleteIncident(req: Request<IdParams>, res: Response, next: NextFunction): void {
  try {
    const id = getIdFromParams(req.params.id);
    incidentService.delete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
