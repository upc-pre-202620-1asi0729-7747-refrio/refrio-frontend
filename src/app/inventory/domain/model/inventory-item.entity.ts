import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type StockStatus = 'OK' | 'EXPIRING_SOON' | 'EXPIRED' | 'LOW_STOCK';

/**
 * InventoryItem — core domain entity for BC 03: Inventory & FEFO Dispatch.
 * Represents a perishable item batch managed by FEFO policy.
 */
export class InventoryItem extends BaseEntity {
  productName: string;
  category: string;
  batchCode: string;
  quantity: number;
  unit: string;
  expirationDate: Date;
  warehouseId: number;
  warehouseName: string;
  storageTemp: number;
  status: StockStatus;

  constructor(
    id: number,
    productName: string,
    category: string,
    batchCode: string,
    quantity: number,
    unit: string,
    expirationDate: Date,
    warehouseId: number,
    warehouseName: string,
    storageTemp: number,
    status: StockStatus
  ) {
    super(id);
    this.productName = productName;
    this.category = category;
    this.batchCode = batchCode;
    this.quantity = quantity;
    this.unit = unit;
    this.expirationDate = expirationDate;
    this.warehouseId = warehouseId;
    this.warehouseName = warehouseName;
    this.storageTemp = storageTemp;
    this.status = status;
  }

  /** Days until expiration (negative = already expired) */
  get daysToExpiry(): number {
    const now = new Date();
    const diff = this.expirationDate.getTime() - now.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
