export const INCIDENT_STATUSES = ["New", "In Progress", "Resolved"] as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export interface CreateIncidentRequestDto {
  itemCode: string;
  userId: number;
  dateFrom: string;
  dateTo: string;
  comment: string;
  status: IncidentStatus;
}

export interface UpdateIncidentRequestDto {
  itemCode: string;
  userId: number;
  dateFrom: string;
  dateTo: string;
  comment: string;
  status: IncidentStatus;
}

export interface PatchIncidentRequestDto {
  itemCode?: string;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  comment?: string;
  status?: IncidentStatus;
}

export interface IncidentResponseDto {
  id: number;
  itemCode: string;
  userId: number;
  dateFrom: string;
  dateTo: string;
  comment: string;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
}
