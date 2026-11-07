import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OperationsStore } from '../../../../operations/application/operations.store';
import { Allocation, statusLabels } from '../../../../operations/domain/operations.rules';

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [TranslatePipe, FormsModule, RouterLink, DatePipe],
  templateUrl: './shipments.html',
})
export class ShipmentsComponent {
  ops = inject(OperationsStore);
  private router = inject(Router);
  labels: Record<string, string> = statusLabels;
  open = signal(false);
  step = signal(0);
  error = signal('');
  filter = signal('ALL');
  steps = ['Pedido', 'Picking FEFO', 'Transporte', 'Confirmación'];
  lines = [{ productId: '', quantity: 1 }];
  clientId = '';
  private expectedRecipientId = '';
  origin = '';
  destination = '';
  driver = '';
  vehicle = '';
  eta = '';
  plan: Allocation[] = [];
  codes: string[] = [];
  get preparingCount() {
    return this.ops.shipments().filter((s) => s.status === 'Preparing').length;
  }
  get clientName() {
    return this.ops.clients().find((c) => c.id === this.clientId)?.name;
  }
  get linkedClients() {
    return this.ops.clients().filter((client) => !!client.recipientId);
  }
  get filtered() {
    return this.ops
      .shipments()
      .filter((s) => this.filter() === 'ALL' || s.status === this.filter());
  }
  get productOptions() {
    return this.ops.database.data().inventory;
  }
  get total() {
    return this.plan.reduce((sum, a) => sum + a.quantity, 0);
  }
  batch(id: string) {
    return this.ops.database.data().batches.find((b) => b.id === id);
  }
  product(id: string) {
    return this.productOptions.find((p) => p.id === id)?.name || id;
  }
  start() {
    this.lines = [{ productId: '', quantity: 1 }];
    this.clientId = '';
    this.expectedRecipientId = '';
    this.origin = '';
    this.destination = '';
    this.driver = '';
    this.vehicle = '';
    this.eta = '';
    this.plan = [];
    this.codes = [];
    this.step.set(0);
    this.error.set('');
    this.open.set(true);
  }
  chooseClient() {
    this.destination = this.ops.clients().find((c) => c.id === this.clientId)?.district || '';
  }
  next() {
    this.error.set('');
    try {
      if (this.step() === 0) {
        const client = this.linkedClients.find((item) => item.id === this.clientId);
        if (!client?.recipientId) throw new Error('Selecciona el cliente receptor.');
        this.expectedRecipientId = client.recipientId;
        if (
          !this.lines.length ||
          new Set(this.lines.map((l) => l.productId)).size !== this.lines.length
        )
          throw new Error('Selecciona productos sin repetir.');
        this.plan = this.ops.plan(this.lines);
        this.codes = this.plan.map(() => '');
      }
      if (this.step() === 1 && this.plan.some((a, i) => this.codes[i]?.trim() !== a.batchId))
        throw new Error(
          'El código no coincide. Ingresa los códigos de los lotes en la secuencia FEFO indicada.',
        );
      if (this.step() === 2) {
        if (
          ![this.origin, this.destination, this.driver, this.vehicle, this.eta].every((v) =>
            v.trim(),
          )
        )
          throw new Error('Completa los datos del transporte.');
        if (!(Date.parse(this.eta) > Date.now()))
          throw new Error('Selecciona una entrega estimada futura.');
      }
      this.step.update((s) => s + 1);
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  async confirm() {
    this.error.set('');
    try {
      const id = await this.ops.createShipment({
        clientId: this.clientId,
        expectedRecipientId: this.expectedRecipientId,
        origin: this.origin,
        destination: this.destination,
        driver: this.driver,
        vehicle: this.vehicle,
        eta: this.eta,
        lines: this.lines,
        scanned: this.codes.map((c) => c.trim()),
      });
      this.open.set(false);
      this.router.navigate(['/shipments', id]);
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
