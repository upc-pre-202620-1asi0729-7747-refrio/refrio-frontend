import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OperationsStore } from '../../../../operations/application/operations.store';
import { OperationalMonitoringService } from '../../../../events/application/operational-monitoring.service';
import { statusLabels } from '../../../../operations/domain/operations.rules';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe, RouterLink, FormsModule],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  ops = inject(OperationsStore);
  monitoring = inject(OperationalMonitoringService);
  labels = statusLabels;
  period = signal(7);
  pending = computed(() =>
    this.ops.shipments().filter((s) => !['Delivered', 'Rejected'].includes(s.status)),
  );
  activeAlerts = computed(() => this.monitoring.alertsFor(this.ops.role()));
  recent = computed(() =>
    this.ops.database
      .data()
      .events.filter(
        (e) =>
          (!e.audience || e.audience === 'ALL' || e.audience === this.ops.role()) &&
          Date.parse(e.occurredAt) >= Date.now() - this.period() * 86400000,
      ),
  );
  lossUnits = computed(() =>
    this.ops
      .losses()
      .filter((l) => Date.parse(l.at) >= Date.now() - this.period() * 86400000)
      .reduce((sum, l) => sum + l.quantity, 0),
  );
  movements = computed(() => {
    const events = this.recent();
    return ['Lote recibido', 'Despacho confirmado', 'Recepción confirmada', 'Merma registrada'].map(
      (name) => ({ name, count: events.filter((e) => e.name === name).length }),
    );
  });
}
