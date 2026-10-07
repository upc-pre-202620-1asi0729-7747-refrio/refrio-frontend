import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <div class="page-view animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'CLIENTS.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'CLIENTS.SUBTITLE' | translate }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary">
            <span class="material-symbols-outlined">qr_code_scanner</span>
            {{ 'SUPPLIERS.SCAN_CODE' | translate }}
          </button>
          <button class="btn-primary" (click)="openAddClient()">
            <span class="material-symbols-outlined">add</span>
            {{ 'CLIENTS.ADD_CLIENT' | translate }}
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header-flex">
          <h2 class="card-title">{{ 'CLIENTS.ALL_CLIENTS' | translate }}</h2>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'TABLE.CLIENT_ID' | translate }}</th>
                <th>{{ 'TABLE.NAME' | translate }}</th>
                <th>{{ 'TABLE.BUSINESS_TYPE' | translate }}</th>
                <th style="text-align:center">{{ 'TABLE.ORDERS_MONTH' | translate }}<br><small style="font-weight:400; font-size:10px">({{ 'TABLE.MONTH' | translate }})</small></th>
                <th>{{ 'TABLE.PROVINCE' | translate }}</th>
                <th>{{ 'TABLE.DISTRICT' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (cli of clients(); track cli.id) {
                <tr>
                  <td class="fw-600">{{ cli.id }}</td>
                  <td>{{ cli.name }}</td>
                  <td class="text-muted">{{ cli.type }}</td>
                  <td style="text-align:center">{{ cli.orders }}</td>
                  <td class="fw-600" [class.text-success]="cli.province === 'Lima' || cli.province === 'Ica'" [class.text-warning]="cli.province !== 'Lima' && cli.province !== 'Ica'">{{ cli.province }}</td>
                  <td class="fw-600">{{ cli.district }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Client Modal -->
    @if (isAddClientOpen()) {
      <div class="modal-overlay" (click)="closeAddClient()">
        <div class="modal-content" style="max-width: 400px;" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ 'CLIENTS.MODAL_ADD_TITLE' | translate }}</h3>
            <button class="btn-close" (click)="closeAddClient()">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Client code</label>
              <input type="text" class="form-control" [(ngModel)]="newClient.id" placeholder="CLI-4056-4567">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea class="form-control" [(ngModel)]="newClient.name" placeholder="Sell ..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeAddClient()">Cancel</button>
            <button class="btn-submit" (click)="addClient()">Add Client</button>
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
  `],
})
export class SuppliersComponent implements OnInit {
  private http = inject(HttpClient);
  private basePath = environment.serverBasePath;
  
  isAddClientOpen = signal(false);

  clients = signal<any[]>([]);

  ngOnInit() {
    this.fetchClients();
  }

  fetchClients() {
    this.http.get<any[]>(`${this.basePath}/clients`).subscribe({
      next: (data) => this.clients.set(data),
      error: (err) => console.error('Failed to load clients', err)
    });
  }

  newClient = { id: '', name: '' };

  openAddClient() {
    this.newClient = { id: '', name: '' };
    this.isAddClientOpen.set(true);
  }

  closeAddClient() {
    this.isAddClientOpen.set(false);
  }

  addClient() {
    if (!this.newClient.id) return;
    
    const newRecord = {
      id: this.newClient.id,
      name: this.newClient.name || 'New Client',
      type: 'Bodega',
      orders: 0,
      province: 'Lima',
      district: 'N/A'
    };
    
    this.http.post<any>(`${this.basePath}/clients`, newRecord).subscribe({
      next: (saved) => {
        this.clients.update(list => [saved, ...list]);
        this.closeAddClient();
      },
      error: (err) => console.error('Failed to save client', err)
    });
  }
}
