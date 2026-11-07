import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { OperationalMonitoringService } from '../../../../events/application/operational-monitoring.service';
import { OperationsStore } from '../../../../operations/application/operations.store';
@Component({
  selector: 'app-alert-detail',
  standalone: true,
  imports: [TranslatePipe, RouterLink, FormsModule, DatePipe],
  templateUrl: './alert-detail.html',
})
export class AlertDetailComponent {
  ops = inject(OperationsStore);
  monitoring = inject(OperationalMonitoringService);
  private route = inject(ActivatedRoute);
  id = this.route.snapshot.paramMap.get('id') || '';
  alert = computed(() => {
    const a = this.monitoring.alertById(this.id);
    return a && (a.audience === 'ALL' || a.audience === this.ops.role()) ? a : undefined;
  });
  incident = computed(() => this.ops.database.data().incidents.find((i) => i.id === this.id));
  related = computed(() => {
    const a = this.alert();
    if (!a?.aggregateId) return null;
    const batch = this.ops.batches().find((b) => b.id === a.aggregateId);
    if (batch)
      return {
        label: 'Ver lote afectado',
        route: ['/inventory', batch.productId, 'batch', batch.id],
      };
    const product = this.ops.products().find((p) => p.id === a.aggregateId);
    if (product) return { label: 'Ver producto y lecturas', route: ['/inventory', product.id] };
    const shipment = this.ops.shipments().find((s) => s.id === a.aggregateId);
    return shipment ? { label: 'Ver envío afectado', route: ['/shipments', shipment.id] } : null;
  });
  error = signal('');
  cause = '';
  action = '';
  decision: 'inspect' | 'hold' = 'inspect';
  verification = '';
  async update(stage: 'review' | 'action' | 'resolve') {
    try {
      const a = this.alert();
      if (!a) return;
      await this.ops.updateIncident(
        this.id,
        stage,
        {
          cause: this.cause,
          action: this.action,
          decision: this.decision,
          verification: this.verification,
        },
        a.aggregateId,
        a.audience === 'ALL' ? this.ops.role() : a.audience,
        a,
      );
      this.error.set('');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
