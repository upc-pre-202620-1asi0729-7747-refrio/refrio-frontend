import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-bodeguero-suppliers',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <div class="page-view animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'SUPPLIERS.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'SUPPLIERS.SUBTITLE' | translate }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary">
            <span class="material-symbols-outlined">qr_code_scanner</span>
            {{ 'SUPPLIERS.SCAN_CODE' | translate }}
          </button>
          <button class="btn-primary" (click)="openAddSupplier()">
            <span class="material-symbols-outlined">add</span>
            {{ 'SUPPLIERS.ADD_SUPPLIER' | translate }}
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header-flex">
          <h2 class="card-title">{{ 'SUPPLIERS.ALL_SUPPLIERS' | translate }}</h2>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'TABLE.SUPPLIER_CODE' | translate }}</th>
                <th>{{ 'TABLE.NAME' | translate }}</th>
                <th>{{ 'TABLE.CATEGORY' | translate }}</th>
                <th style="text-align:center;">{{ 'TABLE.DELIVERIES' | translate }}<br><small style="font-weight:400; font-size:10px">({{ 'TABLE.MONTH' | translate }})</small></th>
                <th>{{ 'TABLE.QUALITY_SCORE' | translate }}</th>
                <th>{{ 'TABLE.RATING' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (sup of suppliers(); track sup.id) {
                <tr>
                  <td class="fw-600">{{ sup.code || sup.id }}</td>
                  <td>{{ sup.name }}</td>
                  <td class="text-muted">{{ sup.category }}</td>
                  <td style="text-align:center;">{{ sup.deliveries }}</td>
                  <td class="fw-600" [class.text-success]="sup.score >= 95" [class.text-warning]="sup.score < 95">{{ sup.score }}%</td>
                  <td><span style="color:#fbbf24;">⭐</span> <span class="fw-600">{{ sup.rating }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Supplier Modal -->
    @if (isAddSupplierOpen()) {
      <div class="modal-overlay" (click)="closeAddSupplier()">
        <div class="modal-content" style="max-width: 400px;" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ 'SUPPLIERS.MODAL_ADD_TITLE' | translate }}</h3>
            <button class="btn-close" (click)="closeAddSupplier()">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Supplier Code</label>
              <input type="text" class="form-control" [(ngModel)]="newSupplier.code" placeholder="e.g. REF-4056-4567">
            </div>
            <div class="form-group">
              <label>Name Supplier</label>
              <input type="text" class="form-control" [(ngModel)]="newSupplier.name" placeholder="Enter supplier name">
            </div>
            <div class="form-group">
              <label>Category</label>
              <input type="text" class="form-control" [(ngModel)]="newSupplier.category" placeholder="e.g. Bebidas, General, etc.">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeAddSupplier()">Cancel</button>
            <button class="btn-submit" (click)="addSupplier()">Add Supplier</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-view { display: flex; flex-direction: column; gap: var(--space-6); }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-title { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-gray-900); }
    .page-subtitle { font-size: var(--font-size-sm); color: var(--color-gray-500); margin-top: 4px; max-width: 400px; }
    .header-actions { display: flex; gap: var(--space-3); }
    .btn-primary, .btn-secondary { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-4); border-radius: var(--radius); font-size: var(--font-size-sm); font-weight: 600; cursor: pointer; transition: all var(--transition-fast); }
    .btn-primary { background: var(--color-primary); color: white; border: none; }
    .btn-primary:hover { background: var(--color-primary-dark); }
    .btn-secondary { background: white; color: var(--color-gray-700); border: 1px solid var(--color-gray-300); }
    .btn-secondary:hover { background: var(--color-gray-50); }
    .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); padding: 0 var(--space-4) 0 0; }
    .card-title { font-size: var(--font-size-lg); font-weight: 600; color: var(--color-gray-900); }
    .action-link { font-size: var(--font-size-sm); color: var(--color-primary); font-weight: 600; text-decoration: none; }
    .action-link:hover { text-decoration: underline; }
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; font-size: var(--font-size-xs); font-weight: 600; color: var(--color-gray-500); padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-gray-200); }
    .data-table td { padding: var(--space-4); font-size: var(--font-size-sm); color: var(--color-gray-700); border-bottom: 1px solid var(--color-gray-100); vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tbody tr:hover { background: var(--color-gray-50); }
    .fw-600 { font-weight: 600; }
    .text-muted { color: var(--color-gray-500); }
    .text-success { color: var(--color-success); }
    .text-warning { color: var(--color-warning); }
  `]
})
export class BodegueroSuppliersComponent implements OnInit {
  private http = inject(HttpClient);
  private basePath = environment.serverBasePath;
  
  isAddSupplierOpen = signal(false);

  suppliers = signal<any[]>([]);
  newSupplier = { code: '', name: '', category: '' };

  ngOnInit() {
    this.fetchSuppliers();
  }

  fetchSuppliers() {
    this.http.get<any[]>(`${this.basePath}/suppliers`).subscribe({
      next: (data) => this.suppliers.set(data),
      error: (err) => console.error('Failed to load suppliers', err)
    });
  }

  openAddSupplier() {
    this.newSupplier = { code: '', name: '', category: '' };
    this.isAddSupplierOpen.set(true);
  }

  closeAddSupplier() {
    this.isAddSupplierOpen.set(false);
  }

  addSupplier() {
    if (!this.newSupplier.code || !this.newSupplier.name) return;
    
    const newRecord = {
      code: this.newSupplier.code,
      name: this.newSupplier.name,
      category: this.newSupplier.category || 'General',
      deliveries: 0,
      score: 100,
      rating: '5.0'
    };
    
    this.http.post<any>(`${this.basePath}/suppliers`, newRecord).subscribe({
      next: (saved) => {
        this.suppliers.update(list => [saved, ...list]);
        this.closeAddSupplier();
      },
      error: (err) => console.error('Failed to save supplier', err)
    });
  }
}

