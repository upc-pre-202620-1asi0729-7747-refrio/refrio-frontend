import { Injectable, signal } from '@angular/core';
import { InventoryItem } from '../domain/model/inventory-item.entity';

/**
 * InventoryStore — application state for BC 03: Inventory & FEFO Dispatch.
 */
@Injectable({ providedIn: 'root' })
export class InventoryStore {
  items = signal<InventoryItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Mock data for demo purposes
  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    this.items.set([
      new InventoryItem(1, 'Strawberries', 'Fruits', 'BATCH-001', 240, 'kg',
        new Date('2026-10-07'), 1, 'Lima Central', 4, 'EXPIRING_SOON'),
      new InventoryItem(2, 'Lettuce',      'Vegetables', 'BATCH-002', 180, 'kg',
        new Date('2026-10-10'), 1, 'Lima Central', 3, 'OK'),
      new InventoryItem(3, 'Whole Milk',   'Dairy', 'BATCH-003', 500, 'L',
        new Date('2026-10-08'), 2, 'North Hub', 5, 'EXPIRING_SOON'),
      new InventoryItem(4, 'Frozen Peas',  'Frozen', 'BATCH-004', 320, 'kg',
        new Date('2026-12-01'), 2, 'North Hub', -18, 'OK'),
      new InventoryItem(5, 'Chicken Breast','Meat', 'BATCH-005', 120, 'kg',
        new Date('2026-10-06'), 3, 'South Hub', 2, 'EXPIRING_SOON'),
    ]);
  }

  getExpiringItems(days: number = 3): InventoryItem[] {
    return this.items().filter(i => i.daysToExpiry <= days && i.daysToExpiry >= 0);
  }
}
