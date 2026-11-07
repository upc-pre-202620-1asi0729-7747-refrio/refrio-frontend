import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IamStore } from '../../../../iam/application/iam.store';
import { OperationalMonitoringService } from '../../../../events/application/operational-monitoring.service';
import { TranslationService } from '../../../services/translation.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { OperationsApiService } from '../../../../operations/application/operations-api.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent {
  database = inject(OperationsApiService);
  iamStore = inject(IamStore);
  router = inject(Router);
  translateService = inject(TranslationService);
  private monitoring = inject(OperationalMonitoringService);

  sidebarOpen = signal(true);
  searchQuery = signal('');
  showBodegueroNotification = signal(false);
  showNotificationDropdown = signal(false);
  showProfileDropdown = signal(false);
  showQrModal = signal(false);
  notificationAlerts = computed(() =>
    this.monitoring.alertsFor(this.iamStore.currentUser()?.role).slice(0, 6),
  );
  notificationCount = computed(
    () => this.monitoring.alertsFor(this.iamStore.currentUser()?.role).length,
  );
  topAlarm = computed(() =>
    this.monitoring
      .alertsFor(this.iamStore.currentUser()?.role)
      .find((alert) => alert.severity === 'Critical'),
  );

  toggleNotification() {
    this.showNotificationDropdown.update((v) => !v);
    this.showProfileDropdown.set(false);
  }

  toggleProfileDropdown() {
    this.showProfileDropdown.update((v) => !v);
    this.showNotificationDropdown.set(false);
  }

  openQrModal() {
    this.showProfileDropdown.set(false);
    this.showQrModal.set(true);
  }

  closeQrModal() {
    this.showQrModal.set(false);
  }

  openTrackingModal() {
    this.showNotificationDropdown.set(false);
    this.showBodegueroNotification.set(true);
  }

  navItems = computed(() => {
    const role = this.iamStore.currentUser()?.role;

    // Si es bodeguero / minorista
    if (role === 'Minorista') {
      return [
        { label: 'Dashboard', icon: 'dashboard', route: '/bodeguero-dashboard' },
        { label: 'Inventory', icon: 'inventory_2', route: '/inventory' },
        { label: 'Order History', icon: 'local_shipping', route: '/order-history' },
        { label: 'Alerts', icon: 'warning', route: '/alerts' },
        { label: 'Suppliers', icon: 'people', route: '/bodeguero-suppliers' },
      ];
    }

    // Por defecto (Distribuidor / Supervisor)
    return [
      { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
      { label: 'Inventory', icon: 'inventory_2', route: '/inventory' },
      { label: 'Shipments', icon: 'local_shipping', route: '/shipments' },
      { label: 'Clients', icon: 'people', route: '/suppliers' },
      { label: 'Analytics', icon: 'bar_chart', route: '/analytics' },
      { label: 'Alerts', icon: 'warning', route: '/alerts' },
      { label: 'Events', icon: 'history', route: '/events' },
    ];
  });

  bottomItems: NavItem[] = [{ label: 'Settings', icon: 'settings', route: '/settings' }];

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  logout(): void {
    this.iamStore.signOut();
    this.router.navigate(['/sign-in']);
  }

  toggleLanguage(): void {
    this.translateService.toggleLanguage();
  }
}
