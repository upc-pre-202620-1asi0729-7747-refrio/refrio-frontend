export type EventSource = 'SIMULATED' | 'SYSTEM' | 'USER';
export type EventOutcome = 'INFO' | 'WARNING' | 'BLOCKED' | 'SUCCESS';
export type AlertSeverity = 'Critical' | 'Medium' | 'Low';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'IN_REVIEW' | 'ACTION_RECORDED' | 'RESOLVED';
export type AlertAudience = 'Supervisor' | 'Minorista' | 'ALL';

export interface DomainEvent {
  id: string;
  name: string;
  context: string;
  aggregateId: string;
  occurredAt: string;
  actor: string;
  source: EventSource;
  outcome: EventOutcome;
  description: string;
  ruleId?: string;
  audience?: AlertAudience;
}

export interface OperationalAlert {
  id: string;
  type: string;
  time: string;
  location: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  recommendedAction: string;
  generatedAt: string;
  aggregateId?: string;
  ruleId?: string;
  audience: AlertAudience;
  automatic: boolean;
}

export interface InventorySnapshot {
  id: string;
  name: string;
  category?: string;
  stock?: string;
  temp?: string;
  exp?: string;
  warehouse?: string;
  status?: string;
  audience: Exclude<AlertAudience, 'ALL'>;
}

export interface ShipmentSnapshot {
  id: string;
  recipientId?: string;
  product: string;
  route: string;
  temperature?: string;
  eta?: string;
  status: 'In Transit' | 'Delivered' | 'Delayed' | string;
}

export interface BatchSnapshot {
  id: string;
  productId: string;
  expirationDate?: string;
  location?: string;
  status?: string;
  audience?: Exclude<AlertAudience, 'ALL'>;
}
