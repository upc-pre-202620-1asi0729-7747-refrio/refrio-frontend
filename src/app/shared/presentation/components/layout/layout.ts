import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { IamStore } from '../../../../iam/application/iam.store';
import { TranslationService } from '../../../services/translation.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

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
export class LayoutComponent implements OnInit {
  iamStore = inject(IamStore);
  router = inject(Router);
  translateService = inject(TranslationService);
  private http = inject(HttpClient);
  
  sidebarOpen = signal(true);
  searchQuery = signal('');
  notificationCount = signal(3);
  showBodegueroNotification = signal(false);
  showNotificationDropdown = signal(false);
  showProfileDropdown = signal(false);
  showQrModal = signal(false);
  criticalAlerts = signal<any[]>([]);

  ngOnInit() {
    this.http.get<any[]>(`${environment.serverBasePath}/alerts`).subscribe({
      next: (data) => {
        const critical = data.filter(a => a.severity === 'Critical');
        this.criticalAlerts.set(critical);
        if (this.iamStore.currentUser()?.role !== 'Minorista') {
          this.notificationCount.set(critical.length);
        }
      }
    });
  }

  toggleNotification() {
    this.showNotificationDropdown.update(v => !v);
    this.showProfileDropdown.set(false);
  }

  toggleProfileDropdown() {
    this.showProfileDropdown.update(v => !v);
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
        { label: 'Inventory',  icon: 'inventory_2', route: '/inventory' },
        { label: 'Order History', icon: 'local_shipping', route: '/order-history' },
        { label: 'Suppliers',  icon: 'people', route: '/bodeguero-suppliers' },
      ];
    }
    
    // Por defecto (Distribuidor / Supervisor)
    return [
      { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
      { label: 'Inventory',  icon: 'inventory_2', route: '/inventory' },
      { label: 'Shipments',  icon: 'local_shipping', route: '/shipments' },
      { label: 'Clients',  icon: 'people', route: '/suppliers' },
      { label: 'Analytics',  icon: 'bar_chart', route: '/analytics' },
      { label: 'Alerts',     icon: 'warning', route: '/alerts' },
    ];
  });

  bottomItems: NavItem[] = [
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
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
