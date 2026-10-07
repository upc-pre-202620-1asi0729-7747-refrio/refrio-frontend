import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { IamStore } from '../../../../iam/application/iam.store';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.css',
})
export class InventoryListComponent implements OnInit {
  private http = inject(HttpClient);
  private basePath = environment.serverBasePath;
  iamStore = inject(IamStore);

  isAddBatchOpen = signal(false);
  isAddProductOpen = signal(false);
  isEditProductOpen = signal(false);

  newBatch = { product: '', batchNumber: '', quantity: '', receptionDate: '', supplier: '', expirationDate: '', notes: '' };
  newProduct = { name: '', category: '', warehouse: '', stock: '', temp: '', exp: '' };
  editProduct = { id: '', name: '', category: '', warehouse: '', stock: '', temp: '', status: 'Active' };

  products = signal<any[]>([]);

  filterOptions = ['All', 'Low Stock', 'Expiring Soon'];
  currentFilter = signal('All');

  filteredProducts = computed(() => {
    const filter = this.currentFilter();
    const list = this.products();
    if (filter === 'All') return list;
    if (filter === 'Low Stock') return list.filter(p => Number(p.stock) < 100);
    if (filter === 'Expiring Soon') return list.filter(p => p.name.includes('Milk') || p.name.includes('Strawberry'));
    return list;
  });

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

  cycleFilter() {
    const idx = this.filterOptions.indexOf(this.currentFilter());
    this.currentFilter.set(this.filterOptions[(idx + 1) % this.filterOptions.length]);
  }

  ngOnInit() {
    this.fetchInventory();
  }

  getEndpoint(): string {
    const role = this.iamStore.currentUser()?.role;
    return role === 'Minorista' ? '/bodeguero-inventory' : '/inventory';
  }

  fetchInventory() {
    this.http.get<any[]>(`${this.basePath}${this.getEndpoint()}`).subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error('Failed to load inventory', err)
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OK': return 'badge-success';
      case 'EXPIRING_SOON': return 'badge-warning';
      case 'EXPIRED': return 'badge-danger';
      case 'LOW_STOCK': return 'badge-info';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    return status.replace('_', ' ');
  }

  openAddBatch() {
    this.newBatch = { product: '', batchNumber: '', quantity: '', receptionDate: '', supplier: '', expirationDate: '', notes: '' };
    this.isAddBatchOpen.set(true);
  }

  closeAddBatch() {
    this.isAddBatchOpen.set(false);
  }

  addBatch() {
    if (!this.newBatch.product || !this.newBatch.batchNumber) return;
    this.closeAddBatch();
  }

  openAddProduct() {
    this.newProduct = { name: '', category: '', warehouse: '', stock: '', temp: '', exp: '' };
    this.isAddProductOpen.set(true);
  }

  closeAddProduct() {
    this.isAddProductOpen.set(false);
  }

  openEditProduct(product: any) {
    this.editProduct = { ...product, status: 'Active' }; // Mock data
    this.isEditProductOpen.set(true);
  }

  closeEditProduct() {
    this.isEditProductOpen.set(false);
  }

  saveEditProduct() {
    if (!this.editProduct.id) return;
    
    this.http.put<any>(`${this.basePath}${this.getEndpoint()}/${this.editProduct.id}`, this.editProduct).subscribe({
      next: (updated) => {
        this.products.update(list => list.map(p => p.id === updated.id ? updated : p));
        this.closeEditProduct();
      },
      error: (err) => {
        console.error('Failed to update product', err);
        alert('Error updating product. Check console.');
      }
    });
  }

  addProduct() {
    if (!this.newProduct.name || !this.newProduct.category) return;

    let nextIdNumber = 1;
    const currentProducts = this.products();
    if (currentProducts.length > 0) {
      const ids = currentProducts
        .map(p => String(p.id))
        .map(id => {
          const m = id.match(/\d+$/);
          return m ? parseInt(m[0], 10) : NaN;
        })
        .filter(n => !isNaN(n));
      if (ids.length > 0) {
        nextIdNumber = Math.max(...ids) + 1;
      }
    }
    const formattedIdNumber = nextIdNumber.toString().padStart(3, '0');

    const newRecord = {
      id: `PRD-${formattedIdNumber}`,
      name: this.newProduct.name,
      category: this.newProduct.category,
      warehouse: this.newProduct.warehouse || 'Lima Central',
      stock: this.newProduct.stock || '0',
      temp: this.newProduct.temp || 'N/A',
      exp: this.newProduct.exp || 'N/A'
    };

    this.http.post<any>(`${this.basePath}${this.getEndpoint()}`, newRecord).subscribe({
      next: (saved) => {
        this.products.update(list => [saved, ...list]);
        this.closeAddProduct();
      },
      error: (err) => console.error('Failed to save product', err)
    });
  }
}
