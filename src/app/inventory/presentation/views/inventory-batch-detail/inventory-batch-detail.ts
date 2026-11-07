import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { OperationsStore } from '../../../../operations/application/operations.store';
import { eligible } from '../../../../operations/domain/operations.rules';
@Component({
  selector: 'app-inventory-batch-detail',
  standalone: true,
  imports: [TranslatePipe, RouterLink, FormsModule, DatePipe],
  templateUrl: './inventory-batch-detail.html',
})
export class InventoryBatchDetailComponent {
  ops = inject(OperationsStore);
  route = inject(ActivatedRoute);
  id = this.route.snapshot.paramMap.get('batchId') || '';
  productId = this.route.snapshot.paramMap.get('id') || '';
  batch = computed(() =>
    this.ops.batches().find((b) => b.id === this.id && b.productId === this.productId),
  );
  product = computed(() => this.ops.products().find((p) => p.id === this.productId));
  losses = computed(() => this.ops.losses().filter((l) => l.batchId === this.id));
  receivedShipment = computed(() => {
    if (this.ops.role() !== 'Minorista') return undefined;
    for (const shipment of this.ops.shipments()) {
      const allocation = shipment.receipt?.quantities.find(
        (item) => item.quantity > 0 && `REC-${shipment.id}-${item.batchId}` === this.id,
      );
      if (allocation && shipment.receipt) {
        return { id: shipment.id, quantity: allocation.quantity, at: shipment.receipt.at };
      }
    }
    return undefined;
  });
  intake = computed(() =>
    this.ops.database.data().events.find(
      (event) =>
        event.aggregateId === this.id &&
        event.name === 'Lote recibido' &&
        event.audience === this.ops.role(),
    ),
  );
  eligible = eligible;
  quantity = 1;
  cause = '';
  review = signal(false);
  error = signal('');
  success = signal('');
  async confirm() {
    try {
      await this.ops.recordLoss(this.id, Number(this.quantity), this.cause);
      this.review.set(false);
      this.success.set('Merma guardada. Las existencias y los indicadores están actualizados.');
      this.error.set('');
      this.quantity = 1;
      this.cause = '';
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
