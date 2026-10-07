/**
 * BaseEntity — base class for all domain entities.
 * Provides identity (id) and audit timestamps.
 */
export class BaseEntity {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(id: number, createdAt?: Date, updatedAt?: Date) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
