import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { IamStore } from '../../../../iam/application/iam.store';
import { TranslatePipe } from '../../../pipes/translate.pipe';

interface Order {
  id: string;
  code: string;
  dateStr: string;
  timeStr: string;
  product: string;
  productDesc: string;
  supplier: string;
  amount: string;
  status: 'Entregado' | 'En Tránsito';
}

@Component({
  selector: 'app-bodeguero-dashboard',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './bodeguero-dashboard.html',
  styleUrl: './bodeguero-dashboard.css'
})
export class BodegueroDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private iamStore = inject(IamStore);
  private basePath = environment.serverBasePath;

  products = signal<any[]>([]);

  stockByCategory = computed(() => {
    const list = this.products();
    let total = 0;
    const cats: Record<string, number> = {};
    for (const p of list) {
      const s = parseInt(p.stock, 10) || 0;
      if (!p.category) continue;
      cats[p.category] = (cats[p.category] || 0) + s;
      total += s;
    }
    return Object.keys(cats).map(cat => {
      const units = cats[cat];
      const pct = total === 0 ? 0 : Math.round((units / total) * 100);
      return { name: cat, units, pct };
    }).sort((a, b) => b.units - a.units);
  });

  ngOnInit() {
    this.fetchInventory();
  }

  fetchInventory() {
    const role = this.iamStore.currentUser()?.role;
    const endpoint = role === 'Minorista' ? '/bodeguero-inventory' : '/inventory';
    this.http.get<any[]>(`${this.basePath}${endpoint}`).subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error('Failed to load dashboard inventory', err)
    });
  }
  orders: Order[] = [
    {
      id: 'PED-9042',
      code: 'Guía #8841-B',
      dateStr: 'Hoy, 12:30 PM',
      timeStr: 'Recepción confirmada',
      product: 'Fresas de Primera',
      productDesc: '150 jabas refrigeradas (1,200 kg)',
      supplier: 'Fresh Farms Co.',
      amount: 'S/ 3,450.00',
      status: 'Entregado'
    },
    {
      id: 'PED-9038',
      code: 'Guía #8812-C',
      dateStr: '22 Abr, 10:15 AM',
      timeStr: 'Recepción completa',
      product: 'Arándanos Azules',
      productDesc: '80 cajas clamshell (400 kg)',
      supplier: 'Agroexportadora Valle Sur',
      amount: 'S/ 4,800.00',
      status: 'Entregado'
    },
    {
      id: 'PED-9025',
      code: 'Camión T-402',
      dateStr: 'Llega en 45 min',
      timeStr: 'Est. 03:15 PM',
      product: 'Lechuga Orgánica',
      productDesc: '200 unidades hidropónicas',
      supplier: 'Huertos del Mantaro',
      amount: 'S/ 1,920.00',
      status: 'En Tránsito'
    }
  ];

  filterStatus: 'All' | 'Entregado' | 'En Tránsito' = 'All';

  get filteredOrders() {
    if (this.filterStatus === 'All') return this.orders;
    return this.orders.filter(o => o.status === this.filterStatus);
  }

  toggleStatusFilter() {
    if (this.filterStatus === 'All') {
      this.filterStatus = 'Entregado';
    } else if (this.filterStatus === 'Entregado') {
      this.filterStatus = 'En Tránsito';
    } else {
      this.filterStatus = 'All';
    }
  }
}
