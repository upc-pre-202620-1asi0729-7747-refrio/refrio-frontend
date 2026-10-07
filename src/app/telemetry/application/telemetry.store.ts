import { Injectable, signal } from '@angular/core';
import { TelemetryReading } from '../domain/model/telemetry-reading.entity';

/**
 * TelemetryStore — application state for BC 02: Storage & Device Telemetry.
 */
@Injectable({ providedIn: 'root' })
export class TelemetryStore {
  readings = signal<TelemetryReading[]>([]);
  latestReadings = signal<Map<string, TelemetryReading>>(new Map());
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadMockReadings();
  }

  private loadMockReadings(): void {
    const now = new Date();
    const mockReadings: TelemetryReading[] = [
      new TelemetryReading(1, 'DEV-001', 'camara_frigorifica', 1, 3.8, 85, now, false, 0.2),
      new TelemetryReading(2, 'DEV-002', 'visicooler',         1, 5.2, 78, now, false, -0.1),
      new TelemetryReading(3, 'DEV-003', 'camara_frigorifica', 2, 6.1, 80, now, true,  0),
      new TelemetryReading(4, 'DEV-004', 'telemetria_transito',3, 2.9, 88, now, false, 0.3),
    ];
    this.readings.set(mockReadings);
    const latestMap = new Map<string, TelemetryReading>();
    mockReadings.forEach(r => latestMap.set(r.deviceId, r));
    this.latestReadings.set(latestMap);
  }

  getReadingsAboveThreshold(maxTemp: number): TelemetryReading[] {
    return this.readings().filter(r => r.correctedTemperature > maxTemp);
  }
}
