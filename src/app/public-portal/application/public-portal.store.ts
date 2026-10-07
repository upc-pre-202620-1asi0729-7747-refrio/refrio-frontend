import { Injectable, signal } from '@angular/core';
import { Lead } from '../domain/model/lead.entity';

/**
 * PublicPortalStore — application state for BC 07: Customer Acquisition & Public Portal.
 */
@Injectable({ providedIn: 'root' })
export class PublicPortalStore {
  leads = signal<Lead[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  submitLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt'>): void {
    this.isLoading.set(true);
    // Simulate API call
    setTimeout(() => {
      const newLead = new Lead(
        Date.now(),
        lead.companyName,
        lead.contactName,
        lead.email,
        lead.phone,
        lead.interestedPlan,
        'NEW',
        lead.notes,
        new Date()
      );
      this.leads.update(l => [...l, newLead]);
      this.successMessage.set('¡Gracias! Nos pondremos en contacto contigo pronto.');
      this.isLoading.set(false);
    }, 800);
  }
}
