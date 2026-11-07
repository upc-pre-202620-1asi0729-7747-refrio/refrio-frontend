import { computed, inject, Injectable } from '@angular/core';
import { IamStore } from '../../iam/application/iam.store';
import { OperationsApiService } from './operations-api.service';
import { eligible, planFefo } from '../domain/operations.rules';
import type { Allocation, Audience, Batch, Product, Incident } from '../domain/operations.rules';

@Injectable({ providedIn: 'root' })
export class OperationsStore {
  readonly database = inject(OperationsApiService);
  private iam = inject(IamStore);
  readonly role = computed<Audience>(() =>
    this.iam.currentUser()?.role === 'Minorista' ? 'Minorista' : 'Supervisor',
  );
  readonly products = computed(
    () => this.database.data()[this.role() === 'Minorista' ? 'bodeguero-inventory' : 'inventory'],
  );
  readonly batches = computed(() =>
    this.database
      .data()
      .batches.filter((b) => b.audience === this.role())
      .sort((a, b) => a.expirationDate.localeCompare(b.expirationDate) || a.id.localeCompare(b.id)),
  );
  readonly shipments = computed(() =>
    this.database
      .data()
      .shipments.filter(
        (s) => this.role() === 'Supervisor' || s.recipientId === String(this.iam.currentUser()?.id),
      ),
  );
  readonly clients = computed(() => this.database.data().clients);
  readonly losses = computed(() =>
    this.database.data().losses.filter((l) => l.audience === this.role()),
  );
  readonly availableUnits = computed(() =>
    this.batches()
      .filter((b) => eligible(b))
      .reduce((sum, b) => sum + b.quantity, 0),
  );
  readonly totalUnits = computed(() =>
    this.products().reduce((sum, p) => sum + Number(p.stock), 0),
  );

  plan(lines: { productId: string; quantity: number }[]): Allocation[] {
    return lines.flatMap((line) =>
      planFefo(this.database.data().batches, line.productId, Number(line.quantity)),
    );
  }

  saveProduct(input: Partial<Product>, id?: string): Promise<string> {
    return this.database.execute<string>('saveProduct', [input, id]);
  }

  registerBatch(input: Omit<Batch, 'audience' | 'status'>): Promise<void> {
    return this.database.execute<void>('registerBatch', [input]);
  }

  createShipment(input: {
    clientId: string;
    expectedRecipientId?: string;
    origin: string;
    destination: string;
    driver: string;
    vehicle: string;
    eta: string;
    lines: { productId: string; quantity: number }[];
    scanned: string[];
  }): Promise<string> {
    return this.database.execute<string>('createShipment', [input]);
  }

  advanceShipment(id: string): Promise<void> {
    return this.database.execute<void>('advanceShipment', [id]);
  }

  receiveShipment(
    id: string,
    decision: string,
    quantities: Allocation[],
    notes: string,
  ): Promise<void> {
    return this.database.execute<void>('receiveShipment', [id, decision, quantities, notes]);
  }

  recordLoss(batchId: string, quantity: number, cause: string): Promise<void> {
    return this.database.execute<void>('recordLoss', [batchId, quantity, cause]);
  }

  recordTemperature(productId: string, value: number): Promise<void> {
    return this.database.execute<void>('recordTemperature', [productId, value]);
  }

  updateIncident(
    alertId: string,
    stage: 'review' | 'action' | 'resolve',
    input: Partial<Incident>,
    subjectId?: string,
    audience: Audience = this.role(),
    snapshot?: object,
  ): Promise<void> {
    return this.database.execute<void>('updateIncident', [
      alertId,
      stage,
      input,
      subjectId,
      audience,
      snapshot,
    ]);
  }
}
