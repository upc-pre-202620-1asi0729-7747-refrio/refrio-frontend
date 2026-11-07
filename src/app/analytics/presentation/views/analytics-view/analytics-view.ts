import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OperationsStore } from '../../../../operations/application/operations.store';
import { statusLabels, type ShipmentStatus } from '../../../../operations/domain/operations.rules';

const statusColors: Record<ShipmentStatus, string> = {
  Preparing: '#64748b',
  'In Transit': '#2563eb',
  Delayed: '#b45309',
  'Awaiting Receipt': '#7c3aed',
  Delivered: '#047857',
  Rejected: '#b91c1c',
};
@Component({
  selector: 'app-analytics-view',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  templateUrl: './analytics-view.html',
  styleUrl: './analytics-view.css',
})
export class AnalyticsViewComponent {
  ops = inject(OperationsStore);
  dispatched = computed(() => this.ops.shipments().filter((s) => s.allocations?.length));
  sent = computed(() =>
    this.dispatched()
      .flatMap((s) => s.allocations || [])
      .reduce((n, a) => n + a.quantity, 0),
  );
  received = computed(() =>
    this.dispatched()
      .flatMap((s) => s.receipt?.quantities || [])
      .reduce((n, a) => n + a.quantity, 0),
  );
  losses = computed(() => this.ops.losses().reduce((n, l) => n + l.quantity, 0));
  productVolumes = computed(() => {
    const products = this.ops.database.data().inventory;
    const volumes = new Map<string, { id: string; name: string; sent: number; received: number }>();
    for (const shipment of this.dispatched()) {
      if (shipment.status === 'Preparing') continue;
      for (const allocation of shipment.allocations ?? []) {
        const id = allocation.productId;
        let row = volumes.get(id);
        if (!row) {
          row = { id, name: products.find((product) => product.id === id)?.name ?? id, sent: 0, received: 0 };
          volumes.set(id, row);
        }
        row.sent += allocation.quantity;
      }
      for (const allocation of shipment.receipt?.quantities ?? []) {
        const row = volumes.get(allocation.productId);
        if (row) row.received += allocation.quantity;
      }
    }
    return [...volumes.values()].sort((a, b) => b.sent - a.sent || a.name.localeCompare(b.name));
  });
  maxVolume = computed(() => this.productVolumes().reduce((max, row) => Math.max(max, row.sent), 1));
  shipmentCount = computed(() => this.ops.shipments().length);
  shipmentStatuses = computed(() => {
    const counts = new Map<ShipmentStatus, number>();
    for (const { status } of this.ops.shipments()) counts.set(status, (counts.get(status) ?? 0) + 1);
    return (Object.keys(statusColors) as ShipmentStatus[])
      .filter((status) => counts.has(status))
      .map((status) => ({
        status,
        label: statusLabels[status],
        color: statusColors[status],
        count: counts.get(status)!,
      }));
  });
  statusChart = computed(() => {
    let start = 0;
    const stops = this.shipmentStatuses().map(({ count, color }) => {
      const end = start + (count / this.shipmentCount()) * 100;
      const stop = `${color} ${start}% ${end}%`;
      start = end;
      return stop;
    });
    return `conic-gradient(${stops.join(', ')})`;
  });
  causes = computed(() =>
    [...new Set(this.ops.losses().map((l) => l.cause))].map((cause) => ({
      cause,
      units: this.ops
        .losses()
        .filter((l) => l.cause === cause)
        .reduce((n, l) => n + l.quantity, 0),
    })),
  );
}
