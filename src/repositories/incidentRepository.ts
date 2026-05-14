import { IncidentStatus } from "../dtos/incidentDtos";

export interface IncidentModel {
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

interface IncidentCreateData {
  itemCode: string;
  userId: number;
  dateFrom: string;
  dateTo: string;
  comment: string;
  status: IncidentStatus;
}

interface IncidentPatchData {
  itemCode?: string;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  comment?: string;
  status?: IncidentStatus;
}

class IncidentRepository {
  private incidents: IncidentModel[] = [];
  private nextId = 1;

  public getAll(): IncidentModel[] {
    return [...this.incidents];
  }

  public getById(id: number): IncidentModel | undefined {
    return this.incidents.find((incident) => incident.id === id);
  }

  public create(data: IncidentCreateData): IncidentModel {
    const now = new Date().toISOString();

    const newIncident: IncidentModel = {
      id: this.nextId,
      itemCode: data.itemCode,
      userId: data.userId,
      dateFrom: data.dateFrom,
      dateTo: data.dateTo,
      comment: data.comment,
      status: data.status,
      createdAt: now,
      updatedAt: now
    };

    this.incidents.push(newIncident);
    this.nextId += 1;

    return newIncident;
  }

  public replace(id: number, data: IncidentCreateData): IncidentModel | null {
    const index = this.incidents.findIndex((incident) => incident.id === id);

    if (index === -1) {
      return null;
    }

    const existingIncident = this.incidents[index];

    const updatedIncident: IncidentModel = {
      id: existingIncident.id,
      itemCode: data.itemCode,
      userId: data.userId,
      dateFrom: data.dateFrom,
      dateTo: data.dateTo,
      comment: data.comment,
      status: data.status,
      createdAt: existingIncident.createdAt,
      updatedAt: new Date().toISOString()
    };

    this.incidents[index] = updatedIncident;

    return updatedIncident;
  }

  public patch(id: number, data: IncidentPatchData): IncidentModel | null {
    const index = this.incidents.findIndex((incident) => incident.id === id);

    if (index === -1) {
      return null;
    }

    const existingIncident = this.incidents[index];

    const updatedIncident: IncidentModel = {
      ...existingIncident,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.incidents[index] = updatedIncident;

    return updatedIncident;
  }

  public delete(id: number): boolean {
    const oldLength = this.incidents.length;
    this.incidents = this.incidents.filter((incident) => incident.id !== id);
    return this.incidents.length < oldLength;
  }
}

export const incidentRepository = new IncidentRepository();
