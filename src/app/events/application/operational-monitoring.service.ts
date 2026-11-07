import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { OperationsApiService } from '../../operations/application/operations-api.service';
import {
  AlertAudience,
  AlertSeverity,
  BatchSnapshot,
  DomainEvent,
  InventorySnapshot,
  OperationalAlert,
  ShipmentSnapshot,
} from '../domain/operational-event.model';

interface StoredAlert {
  id: string;
  type: string;
  time: string;
  location: string;
  severity: AlertSeverity;
  aggregateId?: string;
  audience?: AlertAudience;
}

interface MonitoringResult {
  alerts: OperationalAlert[];
  events: DomainEvent[];
}

@Injectable({ providedIn: 'root' })
export class OperationalMonitoringService {
  private readonly database = inject(OperationsApiService);

  private sourceAlerts: OperationalAlert[] = [];
  private sourceEvents: DomainEvent[] = [];
  private inventory: InventorySnapshot[] = [];
  private batches: BatchSnapshot[] = [];
  private shipments: ShipmentSnapshot[] = [];

  readonly alerts = signal<OperationalAlert[]>([]);
  readonly events = signal<DomainEvent[]>([]);
  readonly isLoading = signal(true);
  readonly lastEvaluationAt = signal<string | null>(null);
  readonly activeAlerts = computed(() =>
    this.alerts().filter((alert) => !['RESOLVED', 'ACKNOWLEDGED'].includes(alert.status)),
  );

  constructor() {
    effect(() => {
      const data = this.database.data();
      this.inventory = [
        ...data.inventory.map((item) => ({ ...item, audience: 'Supervisor' as const })),
        ...data['bodeguero-inventory'].map((item) => ({ ...item, audience: 'Minorista' as const })),
      ];
      this.batches = data.batches.filter((b) => b.quantity > 0);
      this.shipments = data.shipments;
      this.sourceAlerts = (data['alerts'] || []).map((alert) => this.normalizeStoredAlert(alert));
      this.sourceEvents = data.events;
      this.isLoading.set(this.database.loading());
      this.evaluate();
    });
  }

  alertsFor(audience?: string): OperationalAlert[] {
    return this.activeAlerts().filter(
      (alert) => alert.audience === 'ALL' || !audience || alert.audience === audience,
    );
  }

  alertById(id: string): OperationalAlert | undefined {
    return this.alerts().find((alert) => alert.id === id);
  }

  private evaluate(): void {
    const generated = this.applyRules(new Date());
    const combinedAlerts = this.uniqueById([...generated.alerts, ...this.sourceAlerts])
      .map((alert) => ({
        ...alert,
        status:
          this.database.data().incidents.find((i) => i.id === alert.id)?.status ?? alert.status,
      }))
      .sort((a, b) => this.alertPriority(a) - this.alertPriority(b));

    this.alerts.set(combinedAlerts);
    this.events.set(
      this.sortEvents(this.uniqueById([...generated.events, ...this.sourceEvents])),
    );
    this.lastEvaluationAt.set(new Date().toISOString());
  }

  private applyRules(now: Date): MonitoringResult {
    const result: MonitoringResult = { alerts: [], events: [] };
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    for (const batch of this.batches) {
      const inventoryItem = this.inventory.find(
        (item) => item.id === batch.productId && item.audience === batch.audience,
      );
      this.evaluateExpiration(
        {
          id: batch.id,
          name: inventoryItem?.name ?? `Lote ${batch.id}`,
          expirationDate: batch.expirationDate,
          location: batch.location || inventoryItem?.warehouse || 'Ubicación no registrada',
          audience: batch.audience ?? 'Supervisor',
        },
        today,
        result,
      );
    }

    for (const item of this.inventory) {
      const hasBatch = this.batches.some(
        (batch) => batch.productId === item.id && batch.audience === item.audience,
      );
      if (!hasBatch) {
        this.evaluateExpiration(
          {
            id: item.id,
            name: item.name,
            expirationDate: item.exp,
            location: item.warehouse || 'Ubicación no registrada',
            audience: item.audience,
          },
          today,
          result,
        );
      }
      this.evaluateTemperature(item, result);
      this.evaluateStock(item, result);
    }

    for (const shipment of this.shipments) {
      if (shipment.status !== 'Delayed') continue;
      this.addRuleResult(result, {
        ruleId: 'SHIPMENT_DELAYED',
        subjectId: shipment.id,
        type: 'Despacho retrasado',
        severity: 'Medium',
        outcome: 'WARNING',
        message: `El despacho de ${shipment.product} por la ruta ${shipment.route} está retrasado.`,
        recommendation:
          'Contactar al transportista, actualizar la hora estimada y verificar la cadena de frío.',
        location: shipment.route,
        audience: shipment.recipientId ? 'ALL' : 'Supervisor',
        time: shipment.eta ? `ETA reportada: ${shipment.eta}` : 'Sin ETA actualizada',
        context: 'Traceability & Certification',
      });
    }

    return result;
  }

  private evaluateExpiration(
    subject: {
      id: string;
      name: string;
      expirationDate?: string;
      location: string;
      audience: Exclude<AlertAudience, 'ALL'>;
    },
    today: Date,
    result: MonitoringResult,
  ): void {
    if (!subject.expirationDate) {
      this.addRuleResult(result, {
        ruleId: 'EXPIRATION_DATE_REQUIRED',
        subjectId: subject.id,
        type: 'Fecha de vencimiento faltante',
        severity: 'Medium',
        outcome: 'WARNING',
        message: `${subject.name} no tiene una fecha de vencimiento registrada.`,
        recommendation: 'Registrar la fecha de vencimiento antes de permitir el despacho.',
        location: subject.location,
        audience: subject.audience,
        time: 'Requiere revisión',
      });
      return;
    }

    const expiration = new Date(`${subject.expirationDate}T00:00:00`);
    if (Number.isNaN(expiration.getTime())) return;
    const days = Math.ceil((expiration.getTime() - today.getTime()) / 86_400_000);
    if (days > 7) return;

    const expired = days < 0;
    const todayExpiry = days === 0;
    const severity: AlertSeverity = expired || todayExpiry || days <= 3 ? 'Critical' : 'Medium';
    const type = expired
      ? 'Lote vencido'
      : todayExpiry
        ? 'Lote vence hoy'
        : 'Lote próximo a vencer';
    const message = expired
      ? `${subject.name} venció hace ${Math.abs(days)} día${Math.abs(days) === 1 ? '' : 's'}.`
      : todayExpiry
        ? `${subject.name} vence hoy.`
        : `${subject.name} vence en ${days} días (${subject.expirationDate}).`;
    const recommendation = expired
      ? 'Inmovilizar el lote y evitar su despacho hasta que se registre la disposición final.'
      : 'Priorizar la salida con FEFO y confirmar que el producto siga siendo apto.';

    this.addRuleResult(result, {
      ruleId: 'EXPIRATION_WINDOW',
      subjectId: subject.id,
      type,
      severity,
      outcome: expired ? 'BLOCKED' : 'WARNING',
      message,
      recommendation,
      location: subject.location,
      audience: subject.audience,
      time: expired
        ? `Vencido hace ${Math.abs(days)} días`
        : days === 0
          ? 'Vence hoy'
          : `Vence en ${days} días`,
    });
  }

  private evaluateTemperature(item: InventorySnapshot, result: MonitoringResult): void {
    const range = this.temperatureRange(item.category ?? '');
    const value = Number.parseFloat((item.temp ?? '').replace(',', '.'));
    if (Number.isNaN(value)) {
      this.addRuleResult(result, {
        ruleId: 'TEMPERATURE_REQUIRED',
        subjectId: item.id,
        type: 'Temperatura no disponible',
        severity: 'Medium',
        outcome: 'WARNING',
        message: `${item.name} no tiene una lectura de temperatura válida.`,
        recommendation: 'Verificar el sensor y registrar una lectura antes del despacho.',
        location: item.warehouse || 'Ubicación no registrada',
        audience: item.audience,
        time: 'Sin lectura válida',
      });
      return;
    }

    if (value >= range.min && value <= range.max) return;
    this.addRuleResult(result, {
      ruleId: 'TEMPERATURE_OUT_OF_RANGE',
      subjectId: item.id,
      type: 'Temperatura fuera de rango',
      severity: 'Critical',
      outcome: 'WARNING',
      message: `${item.name} registra ${value} °C; el rango esperado es de ${range.min} a ${range.max} °C.`,
      recommendation:
        'Revisar el equipo de frío, inspeccionar el producto e inmovilizarlo si corresponde.',
      location: item.warehouse || 'Ubicación no registrada',
      audience: item.audience,
      time: 'Detectado en la última evaluación',
    });
  }

  private evaluateStock(item: InventorySnapshot, result: MonitoringResult): void {
    const stock = Number.parseFloat(item.stock ?? '');
    if (Number.isNaN(stock) || stock > 20) return;
    const empty = stock <= 0;
    this.addRuleResult(result, {
      ruleId: 'LOW_STOCK',
      subjectId: item.id,
      type: empty ? 'Producto sin stock' : 'Stock bajo',
      severity: empty ? 'Critical' : 'Medium',
      outcome: 'WARNING',
      message: empty
        ? `${item.name} no tiene unidades disponibles.`
        : `${item.name} tiene ${stock} unidades disponibles.`,
      recommendation: 'Revisar la demanda y programar una reposición antes de agotar existencias.',
      location: item.warehouse || 'Ubicación no registrada',
      audience: item.audience,
      time: 'Detectado en la última evaluación',
      context: 'Inventory & FEFO',
    });
  }

  private addRuleResult(
    result: MonitoringResult,
    data: {
      ruleId: string;
      subjectId: string;
      type: string;
      severity: AlertSeverity;
      outcome: DomainEvent['outcome'];
      message: string;
      recommendation: string;
      location: string;
      audience: AlertAudience;
      time: string;
      context?: string;
    },
  ): void {
    const reading = this.database
      .data()
      .telemetry.filter((t) => t.productId === data.subjectId && t.audience === data.audience)
      .at(-1);
    const suffix = this.safeId(
      `${data.ruleId}-${data.audience === 'ALL' ? 'Supervisor' : data.audience}-${data.subjectId}${data.ruleId.startsWith('TEMPERATURE') && reading ? `-${reading.id}` : ''}`,
    );
    const generatedAt = reading?.at || new Date().toISOString();
    const alertId = `ALT-AUTO-${suffix}`;
    result.alerts.push({
      id: alertId,
      type: data.type,
      time: data.time,
      location: data.location,
      severity: data.severity,
      status: 'OPEN',
      message: data.message,
      recommendedAction: data.recommendation,
      generatedAt,
      aggregateId: data.subjectId,
      ruleId: data.ruleId,
      audience: data.audience,
      automatic: true,
    });
    result.events.push({
      id: `EVT-AUTO-${suffix}`,
      name: data.type,
      context:
        data.context ??
        (data.ruleId.startsWith('TEMPERATURE') ? 'Storage & Telemetry' : 'Inventory & FEFO'),
      aggregateId: data.subjectId,
      occurredAt: generatedAt,
      actor: `Regla ${data.ruleId}`,
      source: 'SYSTEM',
      outcome: data.outcome,
      description: `${data.message} Acción sugerida: ${data.recommendation}`,
      ruleId: data.ruleId,
      audience: data.audience,
    });
  }

  private temperatureRange(category: string): { min: number; max: number } {
    const normalized = category
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    if (/congel|frozen|helado/.test(normalized)) return { min: -25, max: -15 };
    if (/lact|dairy|leche|queso/.test(normalized)) return { min: 1, max: 6 };
    if (/carne|meat|pollo|chicken|seafood|pescado/.test(normalized)) return { min: 0, max: 4 };
    if (/fruta|fruit|verdura|vegetable/.test(normalized)) return { min: 2, max: 8 };
    if (/bebida|drink/.test(normalized)) return { min: 2, max: 10 };
    return { min: 0, max: 8 };
  }

  private normalizeStoredAlert(alert: StoredAlert): OperationalAlert {
    return {
      ...alert,
      status: 'OPEN',
      message:
        (alert as OperationalAlert).message ?? `${alert.type} detectada en ${alert.location}.`,
      recommendedAction:
        (alert as OperationalAlert).recommendedAction ??
        'Revisar la condición, documentar la decisión y cerrar la alerta.',
      generatedAt: (alert as OperationalAlert).generatedAt ?? new Date().toISOString(),
      audience:
        alert.audience ?? (alert.type === 'Approaching Delivery' ? 'Minorista' : 'Supervisor'),
      automatic: false,
    };
  }

  private alertPriority(alert: OperationalAlert): number {
    const status = alert.status === 'OPEN' ? 0 : 10;
    const severity = alert.severity === 'Critical' ? 0 : alert.severity === 'Medium' ? 1 : 2;
    return status + severity;
  }

  private sortEvents(events: DomainEvent[]): DomainEvent[] {
    return [...events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }

  private uniqueById<T extends { id: string }>(items: T[]): T[] {
    return [...new Map(items.map((item) => [item.id, item])).values()];
  }

  private safeId(value: string): string {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
