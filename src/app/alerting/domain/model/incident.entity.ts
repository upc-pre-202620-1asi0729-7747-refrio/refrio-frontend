import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus  = 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'CLOSED';
export type AlertChannel    = 'WhatsApp' | 'Push' | 'SMS';

/**
 * Incident — domain entity for BC 04: Alerting & Incident Management.
 */
export class Incident extends BaseEntity {
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  warehouseId: number;
  warehouseName: string;
  notifiedChannels: AlertChannel[];
  triggeredAt: Date;
  closedAt?: Date;
  closingJustification?: string;
  assignedTo?: string;

  constructor(
    id: number,
    title: string,
    description: string,
    severity: IncidentSeverity,
    status: IncidentStatus,
    warehouseId: number,
    warehouseName: string,
    notifiedChannels: AlertChannel[],
    triggeredAt: Date,
    closedAt?: Date,
    closingJustification?: string,
    assignedTo?: string
  ) {
    super(id);
    this.title = title;
    this.description = description;
    this.severity = severity;
    this.status = status;
    this.warehouseId = warehouseId;
    this.warehouseName = warehouseName;
    this.notifiedChannels = notifiedChannels;
    this.triggeredAt = triggeredAt;
    this.closedAt = closedAt;
    this.closingJustification = closingJustification;
    this.assignedTo = assignedTo;
  }

  get isOpen(): boolean {
    return this.status !== 'CLOSED';
  }
}
