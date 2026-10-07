import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED';
export type SubscriptionPlanType = 'Basico' | 'Profesional' | 'Empresarial';

/**
 * Lead — domain entity for BC 07: Customer Acquisition & Public Portal.
 * Represents a B2B lead captured via the public landing page.
 */
export class Lead extends BaseEntity {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  interestedPlan: SubscriptionPlanType;
  status: LeadStatus;
  notes: string;
  submittedAt: Date;

  constructor(
    id: number,
    companyName: string,
    contactName: string,
    email: string,
    phone: string,
    interestedPlan: SubscriptionPlanType,
    status: LeadStatus,
    notes: string,
    submittedAt: Date
  ) {
    super(id);
    this.companyName = companyName;
    this.contactName = contactName;
    this.email = email;
    this.phone = phone;
    this.interestedPlan = interestedPlan;
    this.status = status;
    this.notes = notes;
    this.submittedAt = submittedAt;
  }
}
