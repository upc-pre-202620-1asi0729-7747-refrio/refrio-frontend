import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * BusinessMetric — domain entity for BC 06: Analytics & Business Impact.
 * Represents a computed business KPI or AI prediction result.
 */
export class BusinessMetric extends BaseEntity {
  metricName: string;
  value: number;
  unit: string;
  period: string;
  warehouseId?: number;
  category?: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  trendPercentage: number;

  constructor(
    id: number,
    metricName: string,
    value: number,
    unit: string,
    period: string,
    trend: 'UP' | 'DOWN' | 'STABLE',
    trendPercentage: number,
    warehouseId?: number,
    category?: string
  ) {
    super(id);
    this.metricName = metricName;
    this.value = value;
    this.unit = unit;
    this.period = period;
    this.trend = trend;
    this.trendPercentage = trendPercentage;
    this.warehouseId = warehouseId;
    this.category = category;
  }
}
