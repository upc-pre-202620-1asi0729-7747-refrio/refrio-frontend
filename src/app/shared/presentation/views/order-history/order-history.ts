import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css'
})
export class OrderHistoryComponent {
  Math = Math;

  orders = [
    { id: 'PED-9042', doc: 'Guía #8841-B',  date: 'Hoy, 12:30 PM', statusDesc: 'Recepción confirmada',  product: 'Fresas de Primera', qty: '150 jabas refrigeradas (1,200 kg)', supplier: 'Fresh Farms Co.', amount: 'S/ 3,450.00', status: 'Entregado', icon: 'check_circle', colorClass: 'badge-primary' },
    { id: 'PED-9038', doc: 'Guía #8812-C',  date: '22 Abr, 10:15 AM', statusDesc: 'Recepción completa', product: 'Arándanos Azules', qty: '80 cajas clamshell (400 kg)', supplier: 'Agroexportadora Valle Sur', amount: 'S/ 4,800.00', status: 'Entregado', icon: 'check_circle', colorClass: 'badge-primary' },
    { id: 'PED-9025', doc: 'Camión T-402',  date: 'Llega en 45 min', statusDesc: 'Est. 03:15 PM',      product: 'Lechuga Orgánica', qty: '200 unidades hidropónicas', supplier: 'Huertos del Mantaro', amount: 'S/ 1,920.00', status: 'En Tránsito', icon: 'sensors', colorClass: 'badge-info', datePrimary: true },
    { id: 'PED-9014', doc: 'Guía #8790-A',  date: '18 Abr, 08:45 AM', statusDesc: 'Recepción completa', product: 'Palta Hass Calibre 16', qty: '120 mallas termo-ventiladas', supplier: 'Agroexportadora Valle Sur', amount: 'S/ 5,100.00', status: 'Entregado', icon: 'check_circle', colorClass: 'badge-primary' },
    { id: 'PED-8990', doc: 'Guía #8655-X',  date: '14 Abr, 04:10 PM', statusDesc: 'Merma menor reportada', product: 'Uva Thompson', qty: '90 cajas (2 dañadas en descarga)', supplier: 'Frutícola del Norte', amount: 'S/ 3,100.00', status: 'Observación', icon: 'error', colorClass: 'badge-danger', isAlert: true },
    { id: 'PED-8980', doc: 'Guía #8600-Z',  date: '12 Abr, 11:00 AM', statusDesc: 'Recepción completa', product: 'Mangos Kent', qty: '50 cajas (300 kg)', supplier: 'Piura Farms', amount: 'S/ 2,500.00', status: 'Entregado', icon: 'check_circle', colorClass: 'badge-primary' },
    { id: 'PED-8975', doc: 'Camión T-410',  date: 'Llega mañana, 08:00 AM', statusDesc: 'Est. Mañana 08:00 AM', product: 'Limón Sutil', qty: '100 mallas (500 kg)', supplier: 'Norte Limón S.A.', amount: 'S/ 1,500.00', status: 'En Tránsito', icon: 'sensors', colorClass: 'badge-info', datePrimary: true }
  ];

  // Filters
  currentFilter = signal('Todos');

  // Pagination
  currentPage = signal(1);
  pageSize = 5;

  filteredOrders = computed(() => {
    let list = this.orders;
    const filter = this.currentFilter();
    if (filter === 'Entregados') {
      list = list.filter(o => o.status === 'Entregado');
    } else if (filter === 'En Camino') {
      list = list.filter(o => o.status === 'En Tránsito');
    } else if (filter === 'Observacion') {
      list = list.filter(o => o.status === 'Observación' || o.status === 'Rechazado');
    }
    return list;
  });

  paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredOrders().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredOrders().length / this.pageSize) || 1;
  });

  setFilter(filter: string) {
    this.currentFilter.set(filter);
    this.currentPage.set(1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  get stats() {
    return {
      todos: this.orders.length,
      entregados: this.orders.filter(o => o.status === 'Entregado').length,
      enCamino: this.orders.filter(o => o.status === 'En Tránsito').length,
      observacion: this.orders.filter(o => o.status === 'Observación' || o.status === 'Rechazado').length
    };
  }
}
