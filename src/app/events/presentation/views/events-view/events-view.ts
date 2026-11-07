import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { OperationalMonitoringService } from '../../../application/operational-monitoring.service';
import { DomainEvent } from '../../../domain/operational-event.model';
import { IamStore } from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-events-view',
  standalone: true,
  imports: [TranslatePipe, FormsModule, DatePipe],
  templateUrl: './events-view.html',
  styleUrl: './events-view.css',
})
export class EventsViewComponent {
  private readonly monitoring = inject(OperationalMonitoringService);
  private readonly iamStore = inject(IamStore);

  events = computed(() => {
    const role = this.iamStore.currentUser()?.role;
    return this.monitoring.events().filter(event =>
      !event.audience || event.audience === 'ALL' || !role || event.audience === role,
    );
  });
  isLoading = this.monitoring.isLoading;
  search = signal('');
  selectedContext = signal('ALL');

  contexts = computed(() => [
    'ALL',
    ...Array.from(new Set(this.events().map(event => event.context))),
  ]);

  filteredEvents = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    const context = this.selectedContext();
    return this.events().filter(event => {
      const matchesContext = context === 'ALL' || event.context === context;
      const matchesQuery = !query || [
        event.name,
        event.aggregateId,
        event.actor,
        event.description,
      ].some(value => value.toLocaleLowerCase().includes(query));
      return matchesContext && matchesQuery;
    });
  });

  updateSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  eventIcon(event: DomainEvent): string {
    const icons: Record<DomainEvent['outcome'], string> = {
      INFO: 'thermostat',
      WARNING: 'warning',
      BLOCKED: 'block',
      SUCCESS: 'check_circle',
    };
    return icons[event.outcome];
  }
}
