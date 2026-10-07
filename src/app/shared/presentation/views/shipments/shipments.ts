import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../pipes/translate.pipe';

interface Shipment {
  id: string;
  product: string;
  route: string;
  temperature: string;
  eta: string;
  status: 'In Transit' | 'Delivered' | 'Delayed';
  driver: string;
  vehicle: string;
}

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './shipments.html',
  styleUrl: './shipments.css',
})
export class ShipmentsComponent implements OnInit {
  private http = inject(HttpClient);
  private basePath = environment.serverBasePath;
  
  isAddShipmentOpen = signal(false);
  newShipment = { product: '', batchNumber: '', origin: '', destination: '', temperature: '', eta: '' };

  shipments = signal<Shipment[]>([]);
  
  showRoutesDropdown = signal(false);
  availableRoutes = ['Lima → Surco', 'Callao → Miraflores', 'Lima → San Isidro', 'Surco → Barranco'];
  selectedRoute = signal<string | null>(null);

  filteredShipments = computed(() => {
    const route = this.selectedRoute();
    if (!route) return this.shipments();
    return this.shipments().filter(s => s.route === route);
  });

  ngOnInit() {
    this.fetchShipments();
  }

  fetchShipments() {
    this.http.get<Shipment[]>(`${this.basePath}/shipments`).subscribe({
      next: (data) => {
        this.shipments.set(data);
        // Extract unique routes if needed, but we hardcoded a few common ones
        const unique = Array.from(new Set(data.map(d => d.route)));
        if (unique.length > 0) this.availableRoutes = unique;
      },
      error: (err) => console.error('Failed to load shipments', err)
    });
  }

  toggleRoutesDropdown() {
    this.showRoutesDropdown.update(v => !v);
  }

  selectRoute(route: string | null) {
    this.selectedRoute.set(route);
    this.showRoutesDropdown.set(false);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'In Transit': return 'badge-primary';
      case 'Delivered':  return 'badge-success';
      case 'Delayed':    return 'badge-danger';
      default:           return '';
    }
  }

  openAddShipment() {
    this.newShipment = { product: '', batchNumber: '', origin: '', destination: '', temperature: '', eta: '' };
    this.isAddShipmentOpen.set(true);
  }

  closeAddShipment() {
    this.isAddShipmentOpen.set(false);
  }

  addShipment() {
    if (!this.newShipment.product || !this.newShipment.origin || !this.newShipment.destination) return;
    
    const newRecord = {
      id: `FK-${Math.floor(Math.random() * 1000) + 1000}`,
      product: this.newShipment.product,
      route: `${this.newShipment.origin} → ${this.newShipment.destination}`,
      temperature: this.newShipment.temperature || '4°C',
      eta: this.newShipment.eta || 'TBD',
      status: 'In Transit',
      driver: 'Pending',
      vehicle: 'Pending'
    };
    
    this.http.post<Shipment>(`${this.basePath}/shipments`, newRecord).subscribe({
      next: (saved) => {
        this.shipments.update(list => [saved, ...list]);
        this.closeAddShipment();
      },
      error: (err) => console.error('Failed to save shipment', err)
    });
  }
}
