import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { OperationsStore } from '../../../../operations/application/operations.store';
import { OperationalMonitoringService } from '../../../../events/application/operational-monitoring.service';
import {
  Allocation,
  statusLabels,
  nextStatus,
} from '../../../../operations/domain/operations.rules';

@Component({
  selector: 'app-shipment-detail',
  standalone: true,
  imports: [TranslatePipe, RouterLink, FormsModule, DatePipe],
  templateUrl: './shipment-detail.html',
})
export class ShipmentDetailComponent {
  ops = inject(OperationsStore);
  private monitoring = inject(OperationalMonitoringService);
  private route = inject(ActivatedRoute);
  id = this.route.snapshot.paramMap.get('id') || '';
  shipment = computed(() => this.ops.shipments().find((s) => s.id === this.id));
  labels: Record<string, string> = statusLabels;
  nextStatus = nextStatus;
  steps = computed(() => {
    const status = this.shipment()?.status;
    return [
      'Preparing',
      status === 'Delayed' ? 'Delayed' : 'In Transit',
      'Awaiting Receipt',
      status === 'Rejected' ? 'Rejected' : 'Delivered',
    ];
  });
  incidents = computed(() =>
    this.monitoring.alerts().filter(
      (alert) =>
        alert.aggregateId === this.shipment()?.id &&
        !!alert.aggregateId &&
        (alert.audience === 'ALL' || alert.audience === this.ops.role()),
    ),
  );
  error = signal('');
  success = signal('');
  receiptOpen = signal(false);
  receiptStep = signal(0);
  decision = 'accepted';
  notes = '';
  quantities: Allocation[] = [];
  batch(id: string) {
    return this.ops.database.data().batches.find((b) => b.id === id);
  }
  product(id: string) {
    return this.ops.database.data().inventory.find((p) => p.id === id)?.name || id;
  }
  eventAt(status: string) {
    return this.shipment()?.timeline?.find((t) => t.status === status)?.at;
  }
  get history() {
    return this.ops.database
      .data()
      .events.filter((e) => e.aggregateId === this.id)
      .slice(0, 12);
  }
  async run(action: () => void | Promise<void>) {
    this.error.set('');
    this.success.set('');
    try {
      await action();
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  advance() {
    this.run(async () => {
      await this.ops.advanceShipment(this.id);
      this.success.set('Estado del envío actualizado.');
    });
  }
  startReceipt() {
    this.decision = 'accepted';
    this.notes = '';
    this.quantities = structuredClone(this.shipment()?.allocations || []);
    this.receiptStep.set(0);
    this.receiptOpen.set(true);
    this.error.set('');
  }
  chooseDecision() {
    this.quantities = (this.shipment()?.allocations || []).map((a) => ({
      ...a,
      quantity: this.decision === 'rejected' ? 0 : a.quantity,
    }));
    this.receiptStep.set(0);
  }
  review() {
    this.run(() => {
      if (this.decision !== 'accepted' && !this.notes.trim())
        throw new Error('Indica el motivo antes de continuar.');
      if (
        this.quantities.some(
          (q, i) =>
            !Number.isSafeInteger(Number(q.quantity)) ||
            Number(q.quantity) < 0 ||
            Number(q.quantity) > this.shipment()!.allocations![i].quantity,
        )
      )
        throw new Error('Revisa las cantidades recibidas por lote.');
      this.receiptStep.set(1);
    });
  }
  confirmReceipt() {
    this.run(async () => {
      await this.ops.receiveShipment(
        this.id,
        this.decision,
        this.quantities.map((a) => ({ ...a, quantity: Number(a.quantity) })),
        this.notes,
      );
      this.receiptOpen.set(false);
      this.success.set('Recepción guardada. El inventario y el historial ya están actualizados.');
    });
  }
}
