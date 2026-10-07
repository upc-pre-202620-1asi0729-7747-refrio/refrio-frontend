import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type UserRole = 'Supervisor' | 'Operario' | 'Minorista';
export type SubscriptionPlan = 'Basico' | 'Profesional' | 'Empresarial';

/**
 * User — core domain entity for BC 01: IAM.
 * Represents an authenticated user with role and subscription plan.
 */
export class User extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  sede: string;

  constructor(
    id: number,
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    role: UserRole,
    subscriptionPlan: SubscriptionPlan,
    sede: string
  ) {
    super(id);
    this.username = username;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.subscriptionPlan = subscriptionPlan;
    this.sede = sede;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get initials(): string {
    return `${this.firstName[0]}${this.lastName[0]}`.toUpperCase();
  }
}
