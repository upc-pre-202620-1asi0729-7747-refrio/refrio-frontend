import { Injectable, signal } from '@angular/core';
import { Incident } from '../domain/model/incident.entity';

/**
 * AlertingStore — application state for BC 04: Alerting & Incident Management.
 */
@Injectable({ providedIn: 'root' })
export class AlertingStore {
  incidents = signal<Incident[]>([]);
  openCount = signal(0);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadMockIncidents();
  }

  private loadMockIncidents(): void {
    const now = new Date();
    const list: Incident[] = [
      new Incident(1, 'Temperature Deviation — DEV-002', 'Visicooler exceeded 7°C threshold.',
        'HIGH', 'OPEN', 1, 'Lima Central', ['WhatsApp', 'Push'], now, undefined, undefined, 'Ana García'),
      new Incident(2, 'Compressor Failure Alert — DEV-003', 'Compressor heartbeat lost for 15 min.',
        'CRITICAL', 'ESCALATED', 2, 'North Hub', ['WhatsApp', 'SMS', 'Push'], now, undefined, undefined, 'Carlos Pérez'),
      new Incident(3, 'Batch BATCH-005 Critical Expiry', 'Chicken breast batch expires in 1 day.',
        'MEDIUM', 'IN_PROGRESS', 3, 'South Hub', ['Push'], now, undefined, undefined, 'Ana García'),
    ];
    this.incidents.set(list);
    this.openCount.set(list.filter(i => i.isOpen).length);
  }

  closeIncident(id: number, justification: string): void {
    this.incidents.update(list =>
      list.map(i => {
        if (i.id === id) {
          i.status = 'CLOSED';
          i.closedAt = new Date();
          i.closingJustification = justification;
        }
        return i;
      })
    );
    this.openCount.update(c => Math.max(0, c - 1));
  }
}