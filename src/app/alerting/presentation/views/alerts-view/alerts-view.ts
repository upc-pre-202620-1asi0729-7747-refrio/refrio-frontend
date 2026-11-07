import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { OperationalMonitoringService } from '../../../../events/application/operational-monitoring.service';
import { IamStore } from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-alerts-view',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  templateUrl: './alerts-view.html',
  styleUrl: './alerts-view.css',
})
export class AlertsViewComponent {
  private monitoring = inject(OperationalMonitoringService);
  private iamStore = inject(IamStore);
  showOnlyOpen = signal(true);

  alerts = computed(() => {
    const role = this.iamStore.currentUser()?.role;
    const visible = this.monitoring
      .alerts()
      .filter((alert) => alert.audience === 'ALL' || !role || alert.audience === role);
    return this.showOnlyOpen()
      ? visible.filter((alert) => !['RESOLVED', 'ACKNOWLEDGED'].includes(alert.status))
      : visible;
  });

  openCount = computed(() => this.monitoring.alertsFor(this.iamStore.currentUser()?.role).length);

  statusLabel(status: string): string {
    return (
      {
        OPEN: 'Pendiente',
        IN_REVIEW: 'En revisión',
        ACTION_RECORDED: 'Acción registrada',
        RESOLVED: 'Resuelta',
        ACKNOWLEDGED: 'Atendida',
      } as Record<string, string>
    )[status];
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'Critical':
        return 'badge-danger';
      case 'Medium':
        return 'badge-warning';
      case 'Low':
        return 'badge-primary';
      default:
        return 'badge-info';
    }
  }
}
