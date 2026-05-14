import {
  CreateIncidentRequestDto,
  INCIDENT_STATUSES,
  IncidentResponseDto,
  IncidentStatus,
  PatchIncidentRequestDto,
  UpdateIncidentRequestDto
} from "../dtos/incidentDtos";
import { IncidentModel, incidentRepository } from "../repositories/incidentRepository";
import { userRepository } from "../repositories/userRepository";
import { createNotFoundError, createValidationError } from "../utils/errors";
import {
  ValidationDetail,
  clamp,
  isEnumValue,
  isIsoDateString,
  isNonEmptyString,
  isObject,
  isPositiveInteger,
  parsePositiveIntOrDefault
} from "../utils/validation";

type IncidentSortBy = "id" | "itemCode" | "dateFrom" | "dateTo" | "createdAt";
type SortDir = "asc" | "desc";

const INCIDENT_SORT_FIELDS: IncidentSortBy[] = ["id", "itemCode", "dateFrom", "dateTo", "createdAt"];

export interface IncidentListQuery {
  status?: string;
  itemCode?: string;
  userId?: string;
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortDir?: string;
}

export interface IncidentListResult {
  items: IncidentResponseDto[];
  page: number;
  pageSize: number;
  total: number;
}

class IncidentService {
  public getAll(query: IncidentListQuery): IncidentListResult {
    const page = parsePositiveIntOrDefault(query.page, 1);
    const pageSize = clamp(parsePositiveIntOrDefault(query.pageSize, 10), 1, 100);

    let incidents = incidentRepository.getAll();

    if (query.status && isEnumValue(query.status, INCIDENT_STATUSES)) {
      incidents = incidents.filter((incident) => incident.status === query.status);
    }

    if (query.itemCode && query.itemCode.trim() !== "") {
      const searchItemCode = query.itemCode.trim().toLowerCase();
      incidents = incidents.filter((incident) =>
        incident.itemCode.toLowerCase().includes(searchItemCode)
      );
    }

    if (query.userId) {
      const parsedUserId = Number(query.userId);
      if (Number.isInteger(parsedUserId) && parsedUserId > 0) {
        incidents = incidents.filter((incident) => incident.userId === parsedUserId);
      }
    }

    const sortBy: IncidentSortBy =
      query.sortBy && INCIDENT_SORT_FIELDS.includes(query.sortBy as IncidentSortBy)
        ? (query.sortBy as IncidentSortBy)
        : "id";

    const sortDir: SortDir = query.sortDir === "asc" ? "asc" : "desc";

    incidents.sort((a, b) => this.compareIncidents(a, b, sortBy, sortDir));

    const total = incidents.length;
    const start = (page - 1) * pageSize;
    const pagedIncidents = incidents.slice(start, start + pageSize);

    return {
      items: pagedIncidents.map((incident) => this.toResponseDto(incident)),
      page,
      pageSize,
      total
    };
  }

  public getById(id: number): IncidentResponseDto {
    const incident = incidentRepository.getById(id);

    if (!incident) {
      throw createNotFoundError("Incident not found");
    }

    return this.toResponseDto(incident);
  }

  public create(body: unknown): IncidentResponseDto {
    const dto = this.validateCreateDto(body);
    this.ensureUserExists(dto.userId);

    const createdIncident = incidentRepository.create(dto);
    return this.toResponseDto(createdIncident);
  }

  public replace(id: number, body: unknown): IncidentResponseDto {
    const existingIncident = incidentRepository.getById(id);

    if (!existingIncident) {
      throw createNotFoundError("Incident not found");
    }

    const dto = this.validateUpdateDto(body);
    this.ensureUserExists(dto.userId);

    const replacedIncident = incidentRepository.replace(id, dto);

    if (!replacedIncident) {
      throw createNotFoundError("Incident not found");
    }

    return this.toResponseDto(replacedIncident);
  }

  public patch(id: number, body: unknown): IncidentResponseDto {
    const existingIncident = incidentRepository.getById(id);

    if (!existingIncident) {
      throw createNotFoundError("Incident not found");
    }

    const dto = this.validatePatchDto(body, existingIncident);

    if (dto.userId !== undefined) {
      this.ensureUserExists(dto.userId);
    }

    const patchedIncident = incidentRepository.patch(id, dto);

    if (!patchedIncident) {
      throw createNotFoundError("Incident not found");
    }

    return this.toResponseDto(patchedIncident);
  }

  public delete(id: number): void {
    const deleted = incidentRepository.delete(id);

    if (!deleted) {
      throw createNotFoundError("Incident not found");
    }
  }

  private toResponseDto(incident: IncidentModel): IncidentResponseDto {
    return {
      id: incident.id,
      itemCode: incident.itemCode,
      userId: incident.userId,
      dateFrom: incident.dateFrom,
      dateTo: incident.dateTo,
      comment: incident.comment,
      status: incident.status,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt
    };
  }

  private compareIncidents(
    a: IncidentModel,
    b: IncidentModel,
    sortBy: IncidentSortBy,
    sortDir: SortDir
  ): number {
    let result = 0;

    if (sortBy === "id") {
      result = a.id - b.id;
    } else {
      result = String(a[sortBy]).localeCompare(String(b[sortBy]));
    }

    return sortDir === "asc" ? result : -result;
  }

  private ensureUserExists(userId: number): void {
    const user = userRepository.getById(userId);
    if (!user) {
      throw createValidationError([
        { field: "userId", message: "userId must point to an existing user." }
      ]);
    }
  }

  private validateCreateDto(body: unknown): CreateIncidentRequestDto {
    if (!isObject(body)) {
      throw createValidationError([{ field: "body", message: "Body must be an object." }]);
    }

    const details: ValidationDetail[] = [];
    const itemCodeValue = body.itemCode;
    const userIdValue = body.userId;
    const dateFromValue = body.dateFrom;
    const dateToValue = body.dateTo;
    const commentValue = body.comment;
    const statusValue = body.status;

    let safeItemCode = "";
    let safeUserId = 0;
    let safeDateFrom = "";
    let safeDateTo = "";
    let safeComment = "";
    let safeStatus: IncidentStatus = "New";

    if (!isNonEmptyString(itemCodeValue, 2, 30)) {
      details.push({
        field: "itemCode",
        message: "itemCode is required and must be 2-30 chars."
      });
    } else {
      safeItemCode = itemCodeValue.trim();
    }

    if (!isPositiveInteger(userIdValue)) {
      details.push({ field: "userId", message: "userId is required and must be a positive integer." });
    } else {
      safeUserId = userIdValue;
    }

    if (!isIsoDateString(dateFromValue)) {
      details.push({ field: "dateFrom", message: "dateFrom is required and must be an ISO date string." });
    } else {
      safeDateFrom = dateFromValue;
    }

    if (!isIsoDateString(dateToValue)) {
      details.push({ field: "dateTo", message: "dateTo is required and must be an ISO date string." });
    } else {
      safeDateTo = dateToValue;
    }

    if (!isNonEmptyString(commentValue, 3, 500)) {
      details.push({ field: "comment", message: "comment is required and must be 3-500 chars." });
    } else {
      safeComment = commentValue.trim();
    }

    if (!isEnumValue(statusValue, INCIDENT_STATUSES)) {
      details.push({
        field: "status",
        message: `status must be one of: ${INCIDENT_STATUSES.join(", ")}.`
      });
    } else {
      safeStatus = statusValue;
    }

    if (safeDateFrom && safeDateTo) {
      const dateFromTime = new Date(safeDateFrom).getTime();
      const dateToTime = new Date(safeDateTo).getTime();
      if (dateToTime < dateFromTime) {
        details.push({
          field: "dateTo",
          message: "dateTo cannot be earlier than dateFrom."
        });
      }
    }

    if (details.length > 0) {
      throw createValidationError(details);
    }

    return {
      itemCode: safeItemCode,
      userId: safeUserId,
      dateFrom: safeDateFrom,
      dateTo: safeDateTo,
      comment: safeComment,
      status: safeStatus
    };
  }

  private validateUpdateDto(body: unknown): UpdateIncidentRequestDto {
    return this.validateCreateDto(body);
  }

  private validatePatchDto(body: unknown, currentIncident: IncidentModel): PatchIncidentRequestDto {
    if (!isObject(body)) {
      throw createValidationError([{ field: "body", message: "Body must be an object." }]);
    }

    const details: ValidationDetail[] = [];
    const patchDto: PatchIncidentRequestDto = {};

    if (Object.keys(body).length === 0) {
      details.push({ field: "body", message: "At least one field is required for PATCH." });
    }

    if (body.itemCode !== undefined) {
      if (!isNonEmptyString(body.itemCode, 2, 30)) {
        details.push({ field: "itemCode", message: "itemCode must be 2-30 chars." });
      } else {
        patchDto.itemCode = body.itemCode.trim();
      }
    }

    if (body.userId !== undefined) {
      if (!isPositiveInteger(body.userId)) {
        details.push({ field: "userId", message: "userId must be a positive integer." });
      } else {
        patchDto.userId = body.userId;
      }
    }

    if (body.dateFrom !== undefined) {
      if (!isIsoDateString(body.dateFrom)) {
        details.push({ field: "dateFrom", message: "dateFrom must be an ISO date string." });
      } else {
        patchDto.dateFrom = body.dateFrom;
      }
    }

    if (body.dateTo !== undefined) {
      if (!isIsoDateString(body.dateTo)) {
        details.push({ field: "dateTo", message: "dateTo must be an ISO date string." });
      } else {
        patchDto.dateTo = body.dateTo;
      }
    }

    if (body.comment !== undefined) {
      if (!isNonEmptyString(body.comment, 3, 500)) {
        details.push({ field: "comment", message: "comment must be 3-500 chars." });
      } else {
        patchDto.comment = body.comment.trim();
      }
    }

    if (body.status !== undefined) {
      if (!isEnumValue(body.status, INCIDENT_STATUSES)) {
        details.push({
          field: "status",
          message: `status must be one of: ${INCIDENT_STATUSES.join(", ")}.`
        });
      } else {
        patchDto.status = body.status;
      }
    }

    const finalDateFrom = patchDto.dateFrom ?? currentIncident.dateFrom;
    const finalDateTo = patchDto.dateTo ?? currentIncident.dateTo;

    const finalDateFromTime = new Date(finalDateFrom).getTime();
    const finalDateToTime = new Date(finalDateTo).getTime();

    if (finalDateToTime < finalDateFromTime) {
      details.push({
        field: "dateTo",
        message: "dateTo cannot be earlier than dateFrom."
      });
    }

    if (details.length > 0) {
      throw createValidationError(details);
    }

    return patchDto;
  }
}

export const incidentService = new IncidentService();
