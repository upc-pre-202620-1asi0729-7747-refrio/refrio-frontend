import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type DeviceType = 'camara_frigorifica' | 'visicooler' | 'telemetria_transito';

/**
 * TelemetryReading — domain entity for BC 02: Storage & Device Telemetry.
 * Represents a single temperature/humidity reading from a device.
 */
export class TelemetryReading extends BaseEntity {
  deviceId: string;
  deviceType: DeviceType;
  warehouseId: number;
  temperature: number;
  humidity: number;
  timestamp: Date;
  isHeartbeat: boolean;
  offsetApplied: number;

  constructor(
    id: number,
    deviceId: string,
    deviceType: DeviceType,
    warehouseId: number,
    temperature: number,
    humidity: number,
    timestamp: Date,
    isHeartbeat: boolean = false,
    offsetApplied: number = 0
  ) {
    super(id);
    this.deviceId = deviceId;
    this.deviceType = deviceType;
    this.warehouseId = warehouseId;
    this.temperature = temperature;
    this.humidity = humidity;
    this.timestamp = timestamp;
    this.isHeartbeat = isHeartbeat;
    this.offsetApplied = offsetApplied;
  }

  get correctedTemperature(): number {
    return this.temperature + this.offsetApplied;
  }
}
