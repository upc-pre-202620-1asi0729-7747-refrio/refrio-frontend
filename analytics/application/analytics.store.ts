import { Injectable, signal } from '@angular/core';
import { BusinessMetric } from '../domain/model/business-metric.entity';

/**
 * AnalyticsStore — application state for BC 06: Analytics & Business Impact.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsStore {
  metrics = signal<BusinessMetric[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadMockMetrics();
  }

  private loadMockMetrics(): void {
    this.metrics.set([
      new BusinessMetric(1, 'Mermas Evitadas',       12_400, 'kg',   'Oct 2026', 'UP',     14.2),
      new BusinessMetric(2, 'Capital Salvado',        48_600, 'PEN',  'Oct 2026', 'UP',     8.7),
      new BusinessMetric(3, 'Eficiencia FEFO',            94, '%',    'Oct 2026', 'UP',     2.1),
      new BusinessMetric(4, 'Rotación de Inventario',    8.3, 'x/mes','Oct 2026', 'STABLE', 0),
      new BusinessMetric(5, 'Riesgo Compresor (IA)',       3, 'alertas','Oct 2026', 'DOWN', -25),
    ]);
  }
}
