import type {
  Batch,
  Product,
  Shipment,
  Incident,
  Loss,
  Telemetry,
  Client,
} from './operations.rules';
import type { DomainEvent } from '../../events/domain/operational-event.model';

export interface OperationsDatabase {
  inventory: Product[];
  'bodeguero-inventory': Product[];
  batches: Batch[];
  shipments: Shipment[];
  clients: Client[];
  incidents: Incident[];
  losses: Loss[];
  telemetry: Telemetry[];
  events: DomainEvent[];
  [resource: string]: any[];
}
